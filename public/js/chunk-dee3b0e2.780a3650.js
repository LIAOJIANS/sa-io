(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-dee3b0e2"],{"296f":function(e,t,o){"use strict";o.d(t,"a",(function(){return a}));var n=o("7a23");function a(e){const t=Object(n["shallowReactive"])((()=>{const t={};for(let o in e)t[o]=void 0;return t})()),o=(()=>{const o={};for(let n in e)o[n]=e=>{t[n]=e};return o})();return{refs:t,onRef:o}}},"9e4e":function(e,t,o){"use strict";o.r(t);var n=o("7a23"),a=o("d8e8"),r=o("3ef4"),l=o("79f6"),c=o("296f");t["default"]=Object(n["defineComponent"])({setup(){const e=Object(n["reactive"])({formData:{token:"",username:""},rules:{username:[{required:!0,message:"Please enter the git username",trigger:"change"}],token:[{required:!0,message:"Please enter the git token",trigger:"change"}]},loading:!1}),{onRef:t,refs:o}=Object(c["a"])({form:a["a"]}),s={submit:()=>{var t;null===(t=o.form)||void 0===t||t.validate(t=>{!0===t&&(e.loading=!0,Object(l["n"])(e.formData).then(t=>{Object(r["a"])({message:"success!!",type:"success"}),e.loading=!1}).catch(()=>e.loading=!1))})}};return Object(n["onMounted"])(()=>{Object(l["f"])().then(t=>{e.formData=t.data.content})}),()=>Object(n["createVNode"])("div",null,[Object(n["withDirectives"])(Object(n["createVNode"])(Object(n["resolveComponent"])("el-form"),{model:e.formData,rules:e.rules,"label-width":"auto",style:{width:"600px"},ref:t.form},{default:()=>[Object(n["createVNode"])(Object(n["resolveComponent"])("el-form-item"),{label:"username",prop:"username"},{default:()=>[Object(n["createVNode"])(Object(n["resolveComponent"])("el-input"),{modelValue:e.formData.username,"onUpdate:modelValue":t=>e.formData.username=t,clearable:!0},null)]}),Object(n["createVNode"])(Object(n["resolveComponent"])("el-form-item"),{label:"Token",prop:"token"},{default:()=>[Object(n["createVNode"])(Object(n["resolveComponent"])("el-input"),{modelValue:e.formData.token,"onUpdate:modelValue":t=>e.formData.token=t,type:"textarea"},null)]})]}),[[Object(n["resolveDirective"])("loading"),e.loading]]),Object(n["createVNode"])("div",{style:{textAlign:"center",width:"600px"}},[Object(n["createVNode"])(Object(n["resolveComponent"])("el-button"),{"el-button":!0,type:"primary",onClick:s.submit},{default:()=>[Object(n["createTextVNode"])("保存")]})])])}})}}]);
//# sourceMappingURL=chunk-dee3b0e2.780a3650.js.map