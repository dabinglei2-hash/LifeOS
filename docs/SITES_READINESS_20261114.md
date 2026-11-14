# ChatGPT Sites 现有站点与发布准备检查（2026-11-14）

用户本轮明确选择“使用ChatGPT Sites，先检查现有站点和授权”。检查为只读，尚未授权或执行更新线上版本。

- 已有Site：Life OS，project_id `appgprj_6ae0c18393c0819198cc9248b4799cf9`；当前账户角色owner，访问模式public，保存版本1，既有站点源提交f0bb105ccd266f8fa3cfe7dc0abc1ef9ab55e42b。此源提交不是GitHub产品当前提交。
- 现有地址：https://life-os-personal-20261027.yellowape13.chatgpt.site 。匿名无Cookie、无绕过Token的审计请求：首页及app.js/styles.css/sw.js/manifest均HTTP200。直接index.html请求首次403，改用首页路由和一致审计UA后主要资源可读；保留失败，不用放宽访问规则掩盖。
- 产品来源为814b55ca27bf3d6bdd82762dc371f3fede650b0b；隔离副本按既有白名单构建59个公开文件，约7.7MB，资源摘要/私有路径排除/敏感模式检查通过。产品正式工作树及sw.js未被构建改写。
- 主要JS与产品代码仅有换行差异；CSS、线上SW及manifest字节相同。HTML含平台层变化，未据此声称全部线上UI与原生iPhone验收完成。
- 发布准备不含浏览器localStorage/IndexedDB记录、JSON备份、财务/健康数据、数据库、API凭据、工程日志、Git目录或Python代理代码。
- 现有Python Notion代理属于可选loopback服务，不能直接放入静态Sites。当前页面本地笔记能力可用不等于真实Notion云同步已配置；本轮不改业务代码或创建替代后端。

## 生产更新门禁

复用已有Site与public访问模式，不创建重复Site、不自动改为private/public。需要发布时，先经产品QA/独立审查/正式GitHub门禁，再使用Sites受支持源代码同步与打包流程；精确匹配project_id、站点源commit、构建archive和保存version。正式生产部署须按用户单独授权执行。

本轮未创建写凭据、推送Site源、保存新版本、调用部署API、改环境变量、访问云数据库或更改权限。GitHub现有staging/production仍为缺少发布绑定与授权时失败关闭的骨架；已有Site可访问不等于该自动化部署链已启用。下一步在确认更新范围后建立受支持的站点绑定，保留用户数据来源和回滚版本。
