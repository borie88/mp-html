"use strict";function t(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}Component({data:{ctrl:{}},properties:{childs:Array,opts:Array},attached:function(){this.triggerEvent("add",this,{bubbles:!0,composed:!0})},methods:{noop:function(){},getNode:function(t){for(var e=t.split("_"),i=this.data.childs[e[0]],r=1;r<e.length;r++)i=i.children[e[r]];return i},play:function(t){if(this.root.data.pauseVideo){for(var e=!1,i=t.target.id,r=this.root._videos.length;r--;)this.root._videos[r].id==i?e=!0:this.root._videos[r].pause();if(!e){var s=qq.createVideoContext(i,this);s.id=i,this.root._videos.push(s)}}},imgTap:function(t){var e=this.getNode(t.target.dataset.i);if(e.a)return this.linkTap(e.a);if(!e.attrs.ignore&&(this.root.triggerEvent("imgtap",e.attrs),this.root.data.previewImg)){var i=this.root.imgList[e.i];qq.previewImage({current:i,urls:this.root.imgList})}},imgLoad:function(e){var i,r=e.target.dataset.i,s=this.getNode(r);s.w?(this.data.opts[1]&&!this.data.ctrl[r]||-1==this.data.ctrl[r])&&(i=1):i=e.detail.width,i&&this.setData(t({},"ctrl."+r,i))},linkTap:function(t){var e=t.currentTarget?this.getNode(t.currentTarget.dataset.i):{},i=e.attrs||t,r=i.href;this.root.triggerEvent("linktap",Object.assign({innerText:this.root.getText(e.children||[])},i)),r&&("#"==r[0]?this.root.navigateTo(r.substring(1)).catch(function(){}):r.includes("://")?this.root.data.copyLink&&qq.setClipboardData({data:r,success:function(){return qq.showToast({title:"链接已复制"})}}):qq.navigateTo({url:r,fail:function(){qq.switchTab({url:r,fail:function(){}})}}))},mediaError:function(e){var i=e.target.dataset.i,r=this.getNode(i);if("video"==r.name||"audio"==r.name){var s=(this.data.ctrl[i]||0)+1;if(s>r.src.length&&(s=0),s<r.src.length)return this.setData(t({},"ctrl."+i,s))}else"img"==r.name&&this.data.opts[2]&&this.setData(t({},"ctrl."+i,-1));this.root&&this.root.triggerEvent("error",{source:r.name,attrs:r.attrs,errMsg:e.detail.errMsg})}}});