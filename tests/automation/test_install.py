"""Static validation of the exact reviewed Stage 3 install plan."""
from __future__ import annotations

import json
import hashlib
import importlib.util
import unittest
from unittest import mock
from pathlib import Path

from lads_automation.install import (
    EXPECTED_TARGETS,
    InstallPlanError,
    candidate_snapshot_digest,
    load_install_plan,
    summarize_skills_listing,
    validate_install_plan,
)

ROOT = Path(__file__).resolve().parents[2]
MAP = ROOT / "engineering/lads-stage3-install/install-map.json"
HELPER = ROOT / "engineering/lads-protocol-fix/lifeos-deepseek.py"
HEAD = "aea9e758baac88c310319f34a77f94f2364b0c11"


class InstallPlanTests(unittest.TestCase):
    def current_input_plan(self):
        # The on-disk map is a historical installation proposal. Future feature
        # commits and synthetic Git fixtures must test fresh source bindings,
        # rather than require the whole project to equal that old proposal.
        value = json.loads(MAP.read_text(encoding="utf-8"))
        # HEAD is an explicit input to these static validation tests. A QA
        # archive intentionally carries no Git metadata; do not discover an
        # unrelated ancestor repository. Production verification stays strict.
        value["source_snapshot_sha256"] = candidate_snapshot_digest(ROOT, value["source_head"])
        # Historical proposals stay immutable. This fresh in-memory plan binds
        # today's explicitly authorized source, never a stale installation hash.
        for row in value["targets"]:
            selected = ROOT / row["source_path"]
            row["original_absent"] = not selected.exists()
            row["original_sha256"] = hashlib.sha256(selected.read_bytes()).hexdigest() if selected.exists() else None
        return value

    def test_stale_protected_source_hash_is_still_rejected(self):
        value = self.current_input_plan()
        value["targets"][0]["original_sha256"] = "0" * 64
        # Candidate-installed bytes may still be an allowed exact value; pick
        # the changed active coordinator, which differs from the old candidate.
        row = next(x for x in value["targets"] if x["source_path"] == "scripts/lads_orchestrator.py")
        row["original_sha256"] = "0" * 64
        with mock.patch("lads_automation.install._git_head", return_value=value["source_head"]):
            with self.assertRaises(InstallPlanError):
                validate_install_plan(value, root=ROOT)

    def test_exact_installed_bytes_normalize_to_original_snapshot(self):
        value = json.loads(MAP.read_text(encoding="utf-8"))
        before = {"app.js": "a" * 64}
        installed = dict(before)
        for target in value["targets"]:
            candidate = target["candidate_path"]
            before[candidate] = installed[candidate] = target["candidate_sha256"]
            if not target["original_absent"]:
                before[target["source_path"]] = target["original_sha256"]
            installed[target["source_path"]] = target["candidate_sha256"]
        with mock.patch("lads_automation.install._source_files", return_value=before):
            original = candidate_snapshot_digest(ROOT, HEAD)
        with mock.patch("lads_automation.install._source_files", return_value=installed):
            self.assertEqual(original, candidate_snapshot_digest(ROOT, HEAD))
        installed["app.js"] = "b" * 64
        with mock.patch("lads_automation.install._source_files", return_value=installed):
            self.assertNotEqual(original, candidate_snapshot_digest(ROOT, HEAD))

    def test_exact_twelve_target_plan_validates_against_source_inventory(self):
        value = self.current_input_plan()
        with mock.patch("lads_automation.install._git_head", return_value=value["source_head"]):
            plan = validate_install_plan(value, root=ROOT, expected_head=value["source_head"])
        self.assertEqual(12, len(plan.targets))
        self.assertEqual(set(EXPECTED_TARGETS), {item.source_path for item in plan.targets})
        self.assertEqual(
            candidate_snapshot_digest(ROOT, value["source_head"]),
            plan.source_snapshot_sha256,
        )

    def test_install_plan_rejects_source_snapshot_drift(self):
        value = self.current_input_plan()
        value["source_snapshot_sha256"] = "0" * 64
        with mock.patch("lads_automation.install._git_head", return_value=value["source_head"]):
            with self.assertRaises(InstallPlanError):
                validate_install_plan(value, root=ROOT, expected_head=value["source_head"])

    def test_production_validator_still_requires_verified_git_head(self):
        value = self.current_input_plan()
        with mock.patch("lads_automation.install._git_head", side_effect=InstallPlanError("Git HEAD unavailable")):
            with self.assertRaises(InstallPlanError):
                validate_install_plan(value, root=ROOT)

    def test_production_validator_rejects_a_different_git_head(self):
        value = self.current_input_plan()
        with mock.patch("lads_automation.install._git_head", return_value="0" * 40):
            with self.assertRaises(InstallPlanError):
                validate_install_plan(value, root=ROOT)

    def test_installer_returns_plan_only_and_does_not_install(self):
        text = (ROOT / "lads_automation/install.py").read_text(encoding="utf-8")
        self.assertNotIn("os.replace(", text)
        self.assertNotIn("shutil.copy", text)
        self.assertNotIn("write_bytes(", text)

    def test_existing_candidates_preserve_original_bytes_as_prefix(self):
        pairs = (
            (
                ROOT / ".agents/skills/lifeos-data-guard/SKILL.md",
                ROOT / "engineering/lads-stage3-install/skills/lifeos-data-guard/SKILL.md",
            ),
            (
                ROOT / ".agents/skills/lifeos-ios-design/SKILL.md",
                ROOT / "engineering/lads-stage3-install/skills/lifeos-ios-design/SKILL.md",
            ),
            (
                ROOT / ".agents/skills/lifeos-project-memory/SKILL.md",
                ROOT / "engineering/lads-stage3-install/skills/lifeos-project-memory/SKILL.md",
            ),
            (ROOT / "AGENTS.md", ROOT / "engineering/lads-stage3-install/AGENTS.md"),
        )
        for original, candidate in pairs:
            with self.subTest(candidate=candidate.name):
                self.assertTrue(candidate.read_bytes().startswith(original.read_bytes()))

    def test_seven_skill_candidates_have_valid_contract_sections(self):
        required = (
            "## Applicability",
            "## Steps",
            "## Safety",
            "## Output",
            "## Acceptance",
        )
        candidates = sorted(
            (ROOT / "engineering/lads-stage3-install/skills").glob("*/SKILL.md")
        )
        self.assertEqual(7, len(candidates))
        for path in candidates:
            text = path.read_text(encoding="utf-8")
            with self.subTest(path=path.parent.name):
                self.assertRegex(text, r"(?m)^---\nname: lifeos-[a-z-]+\n")
                self.assertRegex(text, r"(?m)^description: .{20,}\n")
                for heading in (
                    "applicability",
                    "step",
                    "safety",
                    "output",
                    "acceptance",
                ):
                    self.assertIn(heading, text.casefold())

    def test_hook_candidate_has_exact_events_and_machine_runtime(self):
        value = json.loads(
            (ROOT / "engineering/lads-stage3-install/hooks.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(
            {"PreToolUse", "PostToolUse", "SubagentStop", "Stop"},
            set(value["hooks"]),
        )
        encoded = json.dumps(value)
        self.assertIn(
            "C:/Users/Administrator/AppData/Local/LifeOS-LADS/runtime/"
            "kb-py314-20261103-032849/Scripts/python.exe",
            encoded,
        )
        self.assertIn("git rev-parse --show-toplevel", encoded)
        self.assertNotIn("DEEPSEEK_", encoded)

    def test_skills_list_receipt_exposes_only_name_path_errors(self):
        summary = summarize_skills_listing(
            {
                "result": {
                    "skills": [
                        {
                            "name": "lifeos-qa-testing",
                            "description": "must not be exposed",
                            "path": "C:/private/skills/lifeos-qa-testing/SKILL.md",
                            "content": "must not be exposed",
                            "errors": ["synthetic warning"],
                        }
                    ]
                }
            }
        )
        self.assertEqual(
            [
                {
                    "name": "lifeos-qa-testing",
                    "path": "C:/private/skills/lifeos-qa-testing/SKILL.md",
                    "errors": ["synthetic warning"],
                }
            ],
            summary,
        )

    def test_staged_helper_suppresses_global_mcp_names_without_values(self):
        spec = importlib.util.spec_from_file_location(
            "stage3_helper_global_mcp_test",
            HELPER,
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        self.assertEqual(
            ("alpha", "node_repl"),
            module._global_mcp_names_from_data(
                {
                    "mcp_servers": {
                        "node_repl": {"command": "private-value"},
                        "alpha": {"env": {"TOKEN": "private-value"}},
                    }
                }
            ),
        )


if __name__ == "__main__":
    unittest.main()
