<!-- LADS3_FOCUSED_LIVE_ACCEPTANCE_20261104 -->
## 2026-11-04 本轮补验闭环

- RESOLVED：原生回合自动触发已通过，真实命令 exit 7，Pre/Post/Stop 与一次有界继续有实际通知/日志证据；原先超时保留为历史，非屏蔽错误。
- RESOLVED：四角色独立 UI 链路已完成真实 FAIL → CHANGES_REQUESTED → 修复 → PASS → APPROVED → DELIVERY_READY。交接清单格式不一致已修复，精确哈希校验未放宽。
- RESOLVED：不含 .git 的 QA 快照静态单测曾依赖 Git HEAD；现对静态输入与生产 Git 验证分开测试，生产失败仍关闭。
- OPEN：直接项目 hooks.json 发现为 0，需兼容启动器；当前桌面会话热加载未验证。OpenAI WebSocket 超时后 HTTP fallback 成功，仍有启动延迟。
- 未覆盖：iPhone 实机、产品多用户/AI 权限。native PostToolUse 输入未给结构化退出码时如实记 unknown 和哈希；原生验收从独立的 commandExecution 通知校验实际 exit 7，不伪造 Hook 字段。
- 后续优化：本次模型回执累计 input 3,647,293 / output 71,594 tokens（含 API 汇总/缓存口径，不等于独立新计费 token）；未按账单核价，后续可限制任务上下文与预算。

以下保留此前快照；与本节冲突的旧 PENDING/BLOCKED 只代表当时状态。

<!-- LADS3_MAIN_ACCEPTANCE_20261104 -->
## 2026-11-04 阶段 3 当前问题

- OPEN：当前 CLI 直接项目 hooks.json 发现为 0；受支持的 session flags 可发现四事件且已正常信任。兼容启动器 scripts/lads_session.py 已提供，原生模型回合触发探针 150 秒超时，仍不可声称 Pre/Post/Stop 自动触发验收通过。
- OPEN：可选 DeepSeek 完整 UI 链路此次因主配置基线变动门禁而 BLOCKED；未静默改用 GPT 角色。本轮独立审核非前置，主控演练单独标记。
- NOT_IMPLEMENTED：产品真实多用户认证及产品 AI 工具权限；两浏览器上下文仅验证本地存储隔离。iPhone 实机尚未测试。
- RESOLVED（本轮实际回归）：Win32 句柄签名导致后台子进程清理失效；共享配置 raw SHA 重复门禁拒绝合法信任；真实浏览器选择器、Windows JS MIME/PWA、私有测试长路径。75/104/38 测试和合成业务/PWA 验证通过。

历史 BLOCKED 记录保留，不用当前核心 PASS 改写当时失败事实。

以下保留此前记录；与本节冲突的旧状态按历史快照理解。

# LADS 工程系统已知问题

<!-- LADS3_OPERATIONAL_CONTINUATION_20261104 -->
## 2026-11-04 Open Stage 3 issues

- `OPEN / CRITICAL`: Eight generated `__pycache__/*.pyc` files remain outside the allowlist after an explicit compile check. The exact-file cleanup command was rejected by policy and was not retried. The controller must remove these generated artifacts and freeze a fresh candidate digest before QA.
- `OPEN / HIGH`: The allowed staged helper `engineering/lads-protocol-fix/lifeos-deepseek.py` differs from `formal-before`, but the two-target `engineering/lads-protocol-fix/install-map.json` is outside this task's 45-path allowlist and still binds the older helper SHA-256. The existing protocol-guard unittest fails until the controller authorizes and recomputes that separate map.
- `OPEN / HIGH`: The concrete app-server `initialize` + `command/exec` executor has memory/static coverage only. Compatibility with the installed CLI, process-tree cleanup, timeout behavior, and real sandbox effects require host broker evidence.
- `OPEN / HIGH`: The actual notes-server contract, browser/PWA suite, writable file/SQLite acceptance, MAIN-ACK finalizer, and four-role live UI script have not executed in this build. Do not convert source presence into PASS.
- `OPEN / MEDIUM`: Product authentication and AI tool runtime remain `NOT_IMPLEMENTED`; local-origin/CSRF checks are not account isolation.
- `OPEN / MEDIUM`: Native hooks remain uninstalled/untrusted. Hook tests are pure behavior tests and do not claim Codex fired or trusted them.
- `OPEN / MEDIUM`: JSON journals and SQLite/document/index updates are not one cross-system transaction. Retry receipts reduce ambiguity but do not create absolute atomicity.

适用范围：本文仅记录 Life OS 的工程开发自动化、证据流程和基础设施问题，不是产品用户数据、个人记录、健康/财务数据或浏览器备份。

## Open

- `stage3-build3-verification`：Build 3 已加入门禁、单文档恢复、索引幂等重试和 task/session 绑定控制；Builder 两条规定命令为 25/25 与 38/38，但独立 QA、最终 Reviewer 及后续真实文件 smoke 尚未完成，不能提前标记为已解决。

- `stage2-independent-review-pending`：Stage 2 独立 DeepSeek Reviewer/QA 对精确代码摘要的复核仍未完成；历史主控本地验收不能被本 foundation 的自动化测试替代。
- `stage3-part-b-pending`：浏览器 QA runner、team-bridge/Skills、真实 UI 演示和结构化浏览器 QA receipt 尚未实现。
- `native-hooks-not-installed`：当前只有纯处理器与内存测试。没有 active native Hook、trust 安装或 native tool 全覆盖声明。
- `file-and-private-smoke-pending`：FileJournal、DocumentPublisher 私有备份/真实文件恢复、真实知识库绑定索引与 Windows 权限尚未由主控私有文件 smoke 验证。
- `cross-system-atomicity`：JSON 文件、文档文件与 SQLite 索引不存在统一事务。实现依赖幂等事件、单文件原子替换、乐观 SHA 和受限重试，不能宣称跨系统绝对原子性。
- `automation-marker-integration`：自动化事件标记使用独立 `lads-automation:event` 命名空间，避免被 Stage 2 的 `lads:decision|issue` 标记解析器误判。真实索引 smoke 仍待执行。
- `hook-guard-coverage`：Hook 只检查已知高风险模式和可解析路径，不是 sandbox，也无法证明所有 native tool 调用均受控。
- `document-backup-manifest`：备份目录/文件与 manifest 的创建是多个独立文件操作；中断恢复需在 Part B 真实文件测试中验证。

## 关闭条件

每项关闭都必须绑定实际代码摘要、命令、退出状态和 Reviewer/QA 证据。计划、Builder 自述、字符串命中测试或历史截图不能关闭问题。


## 2026-11-04 LADS3 最终阻塞（未修复）

- `LADS3-BROWSER-CLOSE`：Playwright Promise 关闭接口被回调封装，真实浏览器套件存在挂起风险。
- `LADS3-CORRUPT-TASK`：任务 state.json 损坏在 session 解析时被静默跳过，缺少必要告警。
- `LADS3-OPERATIONAL-BRIDGE`：标准运行入口、实际 RPC 执行器、角色完成到文档/知识库的交接及真实 API 参数覆盖仍需实证/补齐。
- 自动循环已达三轮返工上限并停止；75/38 项单元测试通过不抵消最终审查失败。证据及后续范围见 [阶段 3 验收记录](LADS_STAGE3_ACCEPTANCE_REPORT.md)。
