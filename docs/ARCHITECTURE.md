# LifeOS 实际架构

原生 HTML/CSS/JavaScript 单页网站；index.html 为页面结构，app.js 使用 Hash 与 History 管理主/隐藏页面和来源返回；ui-system.js/ui-icons.js 与 styles.css 提供公共 UI。各学习、日程、财务、健康、笔记、妙想 helper/UI 文件沿用原模块。

业务数据为浏览器 localStorage；妙想 assets/drafts/pendingSaves 使用 IndexedDB。JSON v11 导出恢复保持原格式及旧版兼容。server/static_server.py 为本地静态服务，server/notes_server.py 和 notion_service.py 为可选 loopback Notion 代理，不是全站业务数据库。

PWA 为 manifest.webmanifest、sw.js、pwa.js；scripts/build-pwa.mjs 按公开资源白名单输出，不复制整站；check-pwa.mjs 验证资源摘要。构建会更新当前副本的 sw.js，测试必须在独立副本运行。

研发调度、角色、Skills、Hooks、Schema 和工程知识库实现已迁往独立 LifeOS-DevTeam；产品不包含模型密钥。历史提交仍保留曾混放的工程文件，不改写 Git 历史。正式服务器/域名和部署目标尚未配置。

<!-- lads-automation:event {"doc":"docs/ARCHITECTURE.md","id":"9b92d84b-4704-504e-b93d-abb6bf166f45","payload_sha256":"d59c43041f8474d1247773ef25177aad4dabea28bf43180bb5ae3e485462a198"} -->
### LADS event 9b92d84b-4704-504e-b93d-abb6bf166f45

- Task: `f1b9ba0f-f123-480b-a402-a76568fa7c00`
- Event: `architecture_changed`
- Recorded: `2026-11-12T19:08:23.931724Z`
- QA/review verified: `true` (machine delivery receipt `{"acceptance_mode":"independent","authorization_sha256":null,"candidate_sha256":"6c000eff2750ccbfc751adbf412b66db65cbb7be1d20ad63044ee4a451c87387","controller_sha256":"c5c57959abec9ce2634aad5713412e6bf474b361d04979363d91eff7d7e42222","qa_sha256":"decd3c9278cd463f1eaa589725f601fad28fbc2ed2b097387b1d0152085ce09f","reviewer_sha256":"81a9efd288a36b12777723197bb8e9b9226281e224817b4195365b18e79164a9","simulated":false}`)
- summary: "Stage 3 delivery event: architecture_changed"
- reason: "User-authorized dual-repository product migration: main-authored prepared baseline, independent DeepSeek final APPROVED, actual v3 QA and MAIN-ACK verified. MIGRATION_TEST_EVIDENCE.json is the preserved pre-bootstrap checkpoint and does not describe current GitHub or QA status. No publication or deployment is inferred by this local acceptance."
- details: "{\"candidate_sha256\":\"6c000eff2750ccbfc751adbf412b66db65cbb7be1d20ad63044ee4a451c87387\",\"changed_files\":[\"docs/MIGRATION_ACK.md\"],\"changed_files_count\":1,\"changed_files_sha256\":\"4aad177b74e771a90935ac4d6657b1087ef7dd1bc1d2d12fcd3a32e389f51c26\",\"dirty\":true,\"observed_head\":\"607fb7687e7966ef1acfad02c07e558625044d2c\",\"qa_contract_version\":3,\"reason\":\"User-authorized dual-repository product migration: main-authored prepared baseline, independent DeepSeek final APPROVED, actual v3 QA and MAIN-ACK verified. MIGRATION_TEST_EVIDENCE.json is the preserved pre-bootstrap checkpoint and does not describe current GitHub or QA status. No publication or deployment is inferred by this local acceptance.\",\"review\":{\"sha256\":\"81a9efd288a36b12777723197bb8e9b9226281e224817b4195365b18e79164a9\",\"status\":\"APPROVED\"},\"source_head\":\"607fb7687e7966ef1acfad02c07e558625044d2c\",\"task_id\":\"f1b9ba0f-f123-480b-a402-a76568fa7c00\",\"tests\":[{\"command\":\"python -B ../../split-verifier.py automation ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py knowledge ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py lads ../../qa-unit-current.json\",\"exit_code\":0,\"status\":\"completed\"},{\"command\":\"python -B ../../split-verifier.py broker ../../qa-broker-current.json\",\"exit_code\":0,\"status\":\"completed\"}],\"unit_evidence_sha256\":\"1740cf10e7e91e9442e292a0115e9c910d8bf0a8242c4722decda9420e792f9c\",\"working_content_commit\":null}"
- component: "lads-stage3"
<!-- /lads-automation:event -->
