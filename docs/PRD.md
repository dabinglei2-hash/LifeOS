# LifeOS 产品需求

## 已存在的产品能力

原生静态网页提供首页、助手空状态、学习、日程、收支、统计、社交会话演示、妙想富文本/本地图片/OCR、健康手动记录、笔记、习惯、长期目标及 JSON v11 备份。五入口为首页、助手、收支、社交、我的。

## 边界与计划

保持原存储键、ID、USD、统计自然周期和备份兼容；无真实账户或云同步。邀请制多用户和产品 AI 属于计划，健康设备连接、真实 Notion、实机 PWA 和正式部署需独立验收。本次仅拆分仓库，不开发上述能力。

采用黑白灰与 Apple 简洁交互，普通触控区域不小于44px。验收依据是隔离合成数据的历史模块回归、备份恢复、控制台及移动布局，不用演示数据覆盖用户记录。

<!-- lads-automation:event {"doc":"docs/PRD.md","id":"961ad630-9ade-5cd8-a392-437f4605721d","payload_sha256":"ea5eee108aab3e253c8704ca8987880376dcae4422fc540fe0732129bf8d5175"} -->
### LADS event 961ad630-9ade-5cd8-a392-437f4605721d

- Task: `f1b9ba0f-f123-480b-a402-a76568fa7c00`
- Event: `requirements_changed`
- Recorded: `2026-11-12T19:08:23.867058Z`
- QA/review verified: `true` (machine delivery receipt `{"acceptance_mode":"independent","authorization_sha256":null,"candidate_sha256":"6c000eff2750ccbfc751adbf412b66db65cbb7be1d20ad63044ee4a451c87387","controller_sha256":"c5c57959abec9ce2634aad5713412e6bf474b361d04979363d91eff7d7e42222","qa_sha256":"decd3c9278cd463f1eaa589725f601fad28fbc2ed2b097387b1d0152085ce09f","reviewer_sha256":"81a9efd288a36b12777723197bb8e9b9226281e224817b4195365b18e79164a9","simulated":false}`)
- summary: "Stage 3 delivery event: requirements_changed"
- reason: "User-authorized dual-repository product migration: main-authored prepared baseline, independent DeepSeek final APPROVED, actual v3 QA and MAIN-ACK verified. MIGRATION_TEST_EVIDENCE.json is the preserved pre-bootstrap checkpoint and does not describe current GitHub or QA status. No publication or deployment is inferred by this local acceptance."
- details: "{\"candidate_sha256\":\"6c000eff2750ccbfc751adbf412b66db65cbb7be1d20ad63044ee4a451c87387\",\"changed_files\":[\"docs/MIGRATION_ACK.md\"],\"changed_files_count\":1,\"changed_files_sha256\":\"4aad177b74e771a90935ac4d6657b1087ef7dd1bc1d2d12fcd3a32e389f51c26\",\"dirty\":true,\"observed_head\":\"607fb7687e7966ef1acfad02c07e558625044d2c\",\"qa_contract_version\":3,\"reason\":\"User-authorized dual-repository product migration: main-authored prepared baseline, independent DeepSeek final APPROVED, actual v3 QA and MAIN-ACK verified. MIGRATION_TEST_EVIDENCE.json is the preserved pre-bootstrap checkpoint and does not describe current GitHub or QA status. No publication or deployment is inferred by this local acceptance.\",\"review\":{\"sha256\":\"81a9efd288a36b12777723197bb8e9b9226281e224817b4195365b18e79164a9\",\"status\":\"APPROVED\"},\"source_head\":\"607fb7687e7966ef1acfad02c07e558625044d2c\",\"task_id\":\"f1b9ba0f-f123-480b-a402-a76568fa7c00\",\"tests\":[{\"command\":\"python -B ../../split-verifier.py automation ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py knowledge ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py lads ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py broker ../../qa-broker-current.json\",\"exit_code\":0,\"status\":\"completed\"}],\"unit_evidence_sha256\":\"1740cf10e7e91e9442e292a0115e9c910d8bf0a8242c4722decda9420e792f9c\",\"working_content_commit\":null}"
- component: "lads-stage3"
<!-- /lads-automation:event -->
