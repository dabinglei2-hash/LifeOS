# 多智能体AI协作文档交付与自查

日期：2026-11-02。任务ID：AI-DOCS-20261102。仓库D:/CODEX/Life OS，main，开工HEAD `aea9e758baac88c310319f34a77f94f2364b0c11`，开工工作区及未跟踪清单为空。本次无业务开发、无实际Agent运行服务，未提交/推送/部署。

## 扫描、计划与授权

先盘点根目录与docs/.codex/.agents文件，检索AI/Agent/Memory/Database/主动规则，再对照现有源码。详读现有PRD、ARCHITECTURE、STATUS、AI_AGENT_SPEC、DATA_MODEL，以及CODEX_WORK_ENVIRONMENT、CODEX_TECH_STACK_AND_TOOLING、DEVELOPMENT_PROGRESS当前基线和开发团队配置；核对CHANGELOG、LIFEOS_PROJECT_SCAN_REPORT、LIFEOS_GITHUB_SYNC_REPORT，保留历史报告为历史证据。没有CODEX_WORK_ENV.md，复用已有全称文档；原先无docs/AI同类专题目录。

代码证据：app.js:4等本地存储定义、ideas-rich.js:40的IndexedDB、server/static_server.py:11/16的静态服务、server/notion_service.py:84的OperationLedger；未把Notion日志数据库推定为全站数据库。未访问真实密钥、用户数据库或浏览器存储。现有[AI工具规范](../AI_AGENT_SPEC.md)和[目标数据模型](../DATA_MODEL.md)保留，新增的是产品角色与治理层。

修改计划：建立八份互补专题 → 九份既有文档加标记式入口与增量约束 → 执行文档/内容/保护检查。已向用户说明现状与目标、Main审核与用户授权、原文保护与用户删除、并发主动配额等冲突解决方案。

独立只读父会话启动参数包含read-only与never，但45秒预检超时，未核实有效隔离或外部连接器约束，未派发Scanner/Reviewer。用户随后明确答复“允许本轮主控完成文档，注明未独立审查”。按此仅主控单写和自查；没有调用Builder/Reviewer，没有把当前unrestricted会话当只读。

## 新建与更新

| 新建 | 内容 |
| --- | --- |
| [README](README.md) | 索引、阅读顺序、状态与维护分工 |
| [AI_ARCHITECTURE](AI_ARCHITECTURE.md) | 总图、六角色协作、与既有体系冲突/待定项 |
| [AGENT_ROLES](AGENT_ROLES.md) | 注册、职责、输入输出、禁止事项 |
| [AGENT_PERMISSIONS](AGENT_PERMISSIONS.md) | 权限表、授权与撤回、权限流程图 |
| [AGENT_COMMUNICATION](AGENT_COMMUNICATION.md) | 信封字段、claim类别、状态、幂等与通信图 |
| [AI_RUNTIME_RULES](AI_RUNTIME_RULES.md) | 预算、超时/失败/uncertain、恢复与开发验收 |
| [PROACTIVE_AGENT](PROACTIVE_AGENT.md) | 3次/09:00—22:00/五话题、三类触发、统一Scheduler及用户控制 |
| [MEMORY_AND_DATA_ARCHITECTURE](MEMORY_AND_DATA_ARCHITECTURE.md) | 十区映射、原文/摘要/记忆、来源版本和用户权利 |
| 本交付报告 | 扫描、修改范围、自查与未完成项 |

原有九文档只插入带AI_GOVERNANCE_20261102标记的新说明：PRD（产品决定）、ARCHITECTURE（目标关系/冲突）、AI_AGENT_SPEC（原工具契约边界）、DATA_MODEL（逻辑分区映射）、CODEX_WORK_ENVIRONMENT（必读与本轮例外）、CODEX_TECH_STACK_AND_TOOLING（未新增依赖）、DEVELOPMENT_PROGRESS（阶段）、STATUS（本次证据）、CHANGELOG（本次记录）。移除本次标记插入块应逐字节还原原文，历史快照不改写。

## 14项内容自查（不是独立Reviewer结论）

| 项目 | 自查依据与结论 |
| --- | --- |
| 六角色完整 | AGENT_ROLES列出Main+五专业角色，职责/输入/输出齐全 |
| 职责不混淆 | Archive忠实摘要、Writer任务文档、Information只读、Research外部证据、Proactive提议 |
| Main调度与审核 | 统一调度；所有专业结果回Main，用户仍掌最终授权 |
| 用户信息只读 | ROLES及PERMISSIONS禁止创建、改写、删除个人事实 |
| 原文不被摘要覆盖 | 数据架构规定追加原文、摘要派生版本，用户删除权例外明示 |
| 正式文档版本保护 | Writer必须审核+授权+版本匹配，无权删除原稿 |
| 外界与个人记忆隔离 | Research Archive独立逻辑区；外部结果不写作个人事实 |
| 每日最多3次 | 全触发/角色/设备共用，原子预留与幂等投递防绕过 |
| 时间窗口 | 用户时区[09:00,22:00)，发送前再次校验 |
| 仅五类话题 | 生活交流、学习跟进、目标管理、新知识分享、日常问候 |
| 主动交流由Main审核 | Proactive只提议；统一Scheduler与聊天网关 |
| 统一数据接口 | 十区统一授权/来源/版本，Agent无任意数据库写权 |
| 兼容现有项目 | 不改现有十键/IDB/JSON v11；目标模型与代码现状分离 |
| 后续开发可遵循 | 索引及九文档加入五份必读，按主动/记忆追加必读 |

检查过程中澄清：完整原文保护不等于无限留存、Main审核不等于用户授权、投递未知不得释放额度后重复发送、变更策略或时区不得清零当日额度。这些已写入专题，不以新增业务实现解决。

## 验证、保护与未测项

- 文档检查：UTF-8可解码、标题/代码围栏配对、相对链接存在、8份规范与6张Mermaid图、协议必需字段及主动策略检查；Mermaid只作源码结构检查，未执行图形渲染验收。
- 范围保护：修改前4383个既有文件（含893个JSON）SHA256及9份文档原件备份在 `D:/CODEX/LifeOS-Git-Backups/ai-architecture-20261102-114552/`。本任务仅允许九个既有Markdown变化及docs/AI内新Markdown；标记块移除后原件匹配，业务/配置/JSON/旧备份内容保持。
- 外部证据：上述目录validation.json记录实际检查数量，final-baseline.json绑定HEAD及所有本次文档SHA256，tracked.diff记录具体已跟踪差异。若后续Diff变化，须重新审查，不能复用本次自查为独立审批。
- 未运行：应用功能/浏览器/真实数据恢复/外部API/数据库/调度与主动投递、多账号隔离和只读子Agent端到端测试。本次静态文档通过不等于上述能力通过。
- **独立Reviewer审查未完成**。本报告只有主控自查，不能标APPROVE或宣称独立审查通过；用户批准的本轮例外不改变默认开发流程。

任务期间另发现未跟踪文件 `scripts/lifeos-team.py`，不在本任务写入清单中，来源未核实；按并行用户工作保留，未编辑、暂存或提交。最终工作区清单单独列示，不能将它算成本次文档变更。

## 后续实施建议与待定项

先恢复可核实的只读Scanner/Reviewer流程并独立审这些文档；然后另行批准身份与数据隔离验证、三个首期工具/正式确认链路，再实现六角色与中央原文/记忆服务，最后实现主动Scheduler。每阶段用合成数据验收后再讨论真实恢复与邀请测试，不一次性重构整站。

尚待决定/验证：认证提供方、模型版本/成本/外传条件、托管与后台可达性、数据留存及删除备份周期、时区变更映射细节、去重冷却/优先级权重、中央逻辑区域的具体表/事务/outbox与投递渠道。每日3次、09:00—22:00和五类话题是已确认参数，不能以这些待定项为由擅改。
