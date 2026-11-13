# 产品开发规则

每次先读 docs/PRD.md、docs/ARCHITECTURE.md、docs/STATUS.md，检查 Git 基线及未提交改动，修改既有文件先备份。

不得清空浏览器存储、修改历史 ID/金额/日期/统计口径或 JSON 格式；不得索要或输出密钥、上传个人记录、提交数据库、覆盖用户改动、强推、重写历史或自动部署。

唯一主控为 GPT/Codex。Scanner、Reviewer、Builder、QA Tester 只能通过 LifeOS-DevTeam 的独立 DeepSeek CLI profile 执行，不使用继承 GPT 的原生子 Agent，不静默回退。只读角色须实际权限预检；Builder 使用隔离 worktree；QA 合成环境独立于 Builder。MCP 未验收时保持禁用。

普通任务仅在真实 QA、独立 Reviewer APPROVED、GPT 验收、文档/知识回执、精确 Diff 和必需 GitHub 检查全部通过后才可提交、推送、创建 PR 和原生自动合并。不得将主控本地测试冒充独立批准；高风险变更须人工授权，生产部署独立审批。

本轮用户明确授权主控迁移，记录 main-authorized-exception、reviewer_independent=false，不放宽发布门禁。每次任务结束更新 STATUS，架构/数据变化同步相应文档，中文汇报实际测试、备份、风险和未测项。

本仓库只含产品源码、产品文档/测试/部署配置；LADS 代码、Skills、Agent 和工程库属于 ../LifeOS-DevTeam。

注册双仓库任务统一使用 LifeOS-DevTeam/scripts/lads_project_flow.py RUN，配套两个正式 repo/QA profile；只读四角色、MAIN-ACK、精确源码与另一仓库快照校验保持。主控实现必须如实标注，独立审查必须覆盖本次全部已准备 Git 差异而非只看 Builder 确认文件。本轮未完成新源码远端门禁前不声明自动发布启用。
