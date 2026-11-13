# Life OS AI 协作规范

版本：1.0 · 2026-11-02。状态：用户已确认的目标设计，尚未实现；本次只建设文档。产品Agent与Codex开发角色分离。总体入口见[索引](README.md)。

本目录是产品运行时AI的分工与策略权威入口，复用现有[AI工具规范](../AI_AGENT_SPEC.md)和[数据模型](../DATA_MODEL.md)，不另造一套业务真实来源。文档获确认不等于运行功能、数据库或调度器已经上线。

## 阅读顺序与维护职责

| 顺序 | 文档 | 唯一负责的主题 |
| --- | --- | --- |
| 1 | [总体架构](AI_ARCHITECTURE.md) | 组件、现状、冲突与演进边界 |
| 2 | [Agent职责](AGENT_ROLES.md) | 六角色输入、输出与协作边界 |
| 3 | [权限](AGENT_PERMISSIONS.md) | 读写范围、审批与强制执行 |
| 4 | [通信](AGENT_COMMUNICATION.md) | 信封、状态、证据与返回规范 |
| 5 | [运行规则](AI_RUNTIME_RULES.md) | 预算、故障、恢复与验收 |
| 6 | [主动交流](PROACTIVE_AGENT.md) | 唯一策略源：3次、09:00—22:00、五类话题 |
| 7 | [记忆与数据](MEMORY_AND_DATA_ARCHITECTURE.md) | 十个逻辑区域、血缘、版本与生命周期 |

未来开发任何AI功能前，Codex必须阅读1—5；主动交互另读6，记忆/数据另读7。新增Agent、改变职责、权限或已确认主动规则前，先更新相关文档、说明影响并取得用户对重大变化的确认，再开发；文档修改不授予数据写入或部署权限。索引负责导航，参数只在所属专题定义，其他文件引用，避免多处配置漂移。

[PRD](../PRD.md)管理产品目标；[ARCHITECTURE](../ARCHITECTURE.md)区分现状与目标；[CODEX_WORK_ENVIRONMENT](../CODEX_WORK_ENVIRONMENT.md)管理开发流程；[STATUS](../STATUS.md)及[DEVELOPMENT_PROGRESS](../DEVELOPMENT_PROGRESS.md)记录证据。不存在CODEX_WORK_ENV.md，使用现有全称文件，不新建同义文档。

## 本次审查状态

开工HEAD见[交付报告](DELIVERY_REPORT.md)。独立read-only父会话预检45秒超时，未派发Scanner/Reviewer；用户明确允许本轮主控单写文档并检查，独立Reviewer审查未完成。此例外仅限本次，不修改AGENTS默认流程，不等同于Reviewer批准。实际检查与待办以交付报告为准。
