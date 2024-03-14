import{_ as i,D as e,o as p,c as t,k as s,a,I as l,R as h,aL as r,aM as o,aN as c}from"./chunks/framework.C_oh29cb.js";const T=JSON.parse('{"title":"Action 自动部署到 SCF","description":"Action 自动部署到 SCF","frontmatter":{"lang":"zh-CN","title":"Action 自动部署到 SCF","description":"Action 自动部署到 SCF"},"headers":[],"relativePath":"guide/action_scf.md","filePath":"guide/action_scf.md","lastUpdated":1690455204000}'),k={name:"guide/action_scf.md"},d=s("h2",{id:"action-scf-文档",tabindex:"-1"},[a("Action SCF 文档 "),s("a",{class:"header-anchor",href:"#action-scf-文档","aria-label":'Permalink to "Action SCF 文档"'},"​")],-1),E=h(`<h2 id="创建仓库" tabindex="-1">创建仓库 <a class="header-anchor" href="#创建仓库" aria-label="Permalink to &quot;创建仓库&quot;">​</a></h2><p>参考 <a href="./github_action">使用 Action 运行</a><code>.github/workflows/xxxxxxx.yaml</code> 内容如下</p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">bilibili-deploy</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  workflow_dispatch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 手动触发</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">jobs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  deploy-bilibili-tool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    runs-on</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ubuntu-latest</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    environment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Production</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    steps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Run Deploy</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        timeout-minutes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\${{secrets.TIMEOUT_MINUTES || 15}}</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 超时时间(分钟)</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          sudo docker run \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           --env BILITOOLS_CONFIG=&quot;\${{ secrets.BILITOOLS_CONFIG }}&quot; \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           --env TENCENT_SECRET_ID=&quot;\${{ secrets.TENCENT_SECRET_ID }}&quot; \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           --env TENCENT_SECRET_KEY=&quot;\${{ secrets.TENCENT_SECRET_KEY }}&quot; \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           --env RUN_SCF_ALL=y \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           -i --rm  \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">           catlair/bilitools-deploy:latest</span></span></code></pre></div><p>此处设置环境变量 <code>RUN_SCF_ALL</code> 值为 <code>y</code>（默认 <code>n</code> ）。在部署完成后会运行自动运行一次云函数（所有用户），方便查看配置是否正确</p><h2 id="github-secrets" tabindex="-1">Github secrets <a class="header-anchor" href="#github-secrets" aria-label="Permalink to &quot;Github secrets&quot;">​</a></h2><p>secrets 配置如下</p><p><img src="`+r+'" alt="setting"></p><p><img src="'+o+'" alt="setting-new"></p><p><img src="'+c+`" alt="setting-new-2"></p><p><strong>BILITOOLS_CONFIG 是压缩了的</strong> <a href="https://www.baidufe.com/fehelper/en-decode/index.html" target="_blank" rel="noreferrer">在这里选择 gzip 压缩</a></p><h2 id="错误案例" tabindex="-1">错误案例 <a class="header-anchor" href="#错误案例" aria-label="Permalink to &quot;错误案例&quot;">​</a></h2><h3 id="偷懒" tabindex="-1">偷懒？ <a class="header-anchor" href="#偷懒" aria-label="Permalink to &quot;偷懒？&quot;">​</a></h3><p>自己不会创建仓库？别 fork 本仓库<br> 请勿直接 fork 本仓库！！！<br> 请勿直接 fork 本仓库！！！<br> 请勿直接 fork 本仓库！！！<br> 请直接创建一个仓库！！！<br> 请直接创建一个仓库！！！<br> 请直接创建一个仓库！！！<br> 你自己还可以创建私有仓库啊！！！<br> 你自己还可以创建私有仓库啊！！！<br> 你自己还可以创建私有仓库啊！！！</p><h3 id="未按要求压缩配置" tabindex="-1">未按要求压缩配置 <a class="header-anchor" href="#未按要求压缩配置" aria-label="Permalink to &quot;未按要求压缩配置&quot;">​</a></h3><p><strong>再三强调配置需要压缩</strong><br> 出现下面这种，BILITOOLS_CONFIG 的配置有好多行，这明显就是没有<strong>压缩</strong><br><code>syntax error near unexpected token (&#39;</code> 错误信息也明确指出是因为特殊符号导致错误</p><div class="language-txt vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">txt</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>  sudo docker run \\</span></span>
<span class="line"><span>   --env BILITOOLS_CONFIG=&quot;***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>    ***</span></span>
<span class="line"><span>  ***&quot; \\</span></span>
<span class="line"><span>   --env TENCENT_SECRET_ID=&quot;***&quot; \\</span></span>
<span class="line"><span>   --env TENCENT_SECRET_KEY=&quot;***&quot; \\</span></span>
<span class="line"><span>   --env RUN_SCF_ALL=y \\</span></span>
<span class="line"><span>   -i --rm  \\</span></span>
<span class="line"><span>   catlair/bilitools-deploy:latest</span></span>
<span class="line"><span>  shell: /usr/bin/bash -e ***0***</span></span>
<span class="line"><span>/home/runner/work/_temp/5ce701de-530a-4127-8121-94b88d4abe8d.sh: line 13: syntax error near unexpected token \`(&#39;</span></span>
<span class="line"><span>Error: Process completed with exit code 2.</span></span></code></pre></div>`,16);function g(_,u,y,F,b,C){const n=e("Badge");return p(),t("div",null,[d,s("p",null,[a("已经废弃"),l(n,{type:"warning",text:"警告",vertical:"top"})]),E])}const f=i(k,[["render",g]]);export{T as __pageData,f as default};
