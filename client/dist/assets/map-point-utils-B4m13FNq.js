import{c as r}from"./index-B26NgMuk.js";function s(i,t){return`<div style="font-family:sans-serif;min-width:120px">
    <strong style="font-size:13px">${i}</strong>
    ${t?`<br/><span style="font-size:11px;color:#666">${t}</span>`:""}
  </div>`}function c(i,t){return/parking/i.test(`${i||""} ${t||""}`)}function e(i,{label:t,sublabel:n,setLocation:o}){return i.bindTooltip(s(t,n),{direction:"top",sticky:!0}),c(t,n)&&i.on("click",()=>o(r(t))),i}export{e as a};
