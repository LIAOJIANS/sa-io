(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-dee3b0e2"],{"296f":function(e,t,o){"use strict";o.d(t,"a",(function(){return n}));var a=o("7a23");function n(e){const t=Object(a["shallowReactive"])((()=>{const t={};for(let o in e)t[o]=void 0;return t})()),o=(()=>{const o={};for(let a in e)o[a]=e=>{t[a]=e};return o})();return{refs:t,onRef:o}}},"9e4e":function(e,t,o){"use strict";o.r(t);var a=o("7a23"),n=o("d8e8"),r=o("3ef4"),l=o("79f6"),c=o("296f");t["default"]=Object(a["defineComponent"])({setup(){const e=Object(a["reactive"])({formData:{token:"",username:""},rules:{username:[{required:!0,message:"Please enter the git username",trigger:"change"}],token:[{required:!0,message:"Please enter the git token",trigger:"change"}]},loading:!1}),{onRef:t,refs:o}=Object(c["a"])({form:n["a"]}),s={submit:()=>{var t;null===(t=o.form)||void 0===t||t.validate(t=>{!0===t&&(e.loading=!0,Object(l["m"])(e.formData).then(t=>{Object(r["a"])({message:"success!!",type:"success"}),e.loading=!1}).catch(()=>e.loading=!1))})}};return Object(a["onMounted"])(()=>{Object(l["e"])().then(t=>{e.formData=t.data.content})}),()=>Object(a["createVNode"])("div",null,[Object(a["withDirectives"])(Object(a["createVNode"])(Object(a["resolveComponent"])("el-form"),{model:e.formData,rules:e.rules,"label-width":"auto",style:{width:"600px"},ref:t.form},{default:()=>[Object(a["createVNode"])(Object(a["resolveComponent"])("el-form-item"),{label:"username",prop:"username"},{default:()=>[Object(a["createVNode"])(Object(a["resolveComponent"])("el-input"),{modelValue:e.formData.username,"onUpdate:modelValue":t=>e.formData.username=t,clearable:!0},null)]}),Object(a["createVNode"])(Object(a["resolveComponent"])("el-form-item"),{label:"Token",prop:"token"},{default:()=>[Object(a["createVNode"])(Object(a["resolveComponent"])("el-input"),{modelValue:e.formData.token,"onUpdate:modelValue":t=>e.formData.token=t,type:"textarea"},null)]})]}),[[Object(a["resolveDirective"])("loading"),e.loading]]),Object(a["createVNode"])("div",{style:{textAlign:"center",width:"600px"}},[Object(a["createVNode"])(Object(a["resolveComponent"])("el-button"),{"el-button":!0,type:"primary",onClick:s.submit},{default:()=>[Object(a["createTextVNode"])("保存")]})])])}})}}]);
//# sourceMappingURL=chunk-dee3b0e2.fbcca24f.js.map