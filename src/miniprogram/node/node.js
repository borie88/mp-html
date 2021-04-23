/**
 * @fileoverview 递归子组件，用于显示节点树
 */
Component({
  data: {
    ctrl: {} // 控制信号
  },
  properties: {
    childs: Array,  // 子节点列表
    opts: Array     // 设置 [是否开启懒加载, 加载中占位图, 错误占位图, 是否使用长按菜单, 强制mode widthFix]
  },
  // #ifndef MP-TOUTIAO
  attached() {
    // #ifndef MP-ALIPAY
    this.triggerEvent('add', this, {
      bubbles: true,
      composed: true
    })
    // #endif
    // #ifdef MP-ALIPAY
    this.props.onAdd(this)
    // #endif
  },
  // #endif
  methods: {
    noop() { },
    /**
     * @description 获取标签
     * @param {String} path 路径
     */
    getNode(path) {
      var nums = path.split('_'),
        node = this.properties.childs[nums[0]]
      for (var i = 1; i < nums.length; i++)
        node = node.children[nums[i]]
      return node
    },
    /**
     * @description 播放视频事件
     * @param {Event} e 
     */
    play(e) {
      if (this.root.properties.pauseVideo) {
        var flag = false, id = e.target.id
        for (var i = this.root._videos.length; i--;) {
          if (this.root._videos[i].id == id)
            flag = true
          else
            this.root._videos[i].pause() // 自动暂停其他视频
        }
        // 将自己加入列表
        if (!flag) {
          var ctx = wx.createVideoContext(id
            // #ifndef MP-BAIDU
            , this
            // #endif
          )
          ctx.id = id
          this.root._videos.push(ctx)
        }
      }
    },

    /**
     * @description 图片点击事件
     * @param {Event} e 
     */
    imgTap(e) {
      var node = this.getNode(e.target.dataset.i)
      // 父级中有链接
      if (node.a)
        return this.linkTap(node.a)
      if (node.attrs.ignore)
        return
      const { x, y } = e.detail
      this.root.triggerEvent('imgtap', Object.assign(node.attrs, {
        x,
        y
      }))
      if (this.root.properties.previewImg) {
        var current =
          // #ifndef MP-ALIPAY
          this.root.imgList[node.i]
        // #endif
        // #ifdef MP-ALIPAY
        node.i
        // #endif
        // 自动预览图片
        wx.previewImage({
          current,
          urls: this.root.imgList
        })
      }
    },

    /**
     * @description 图片长按事件
     * @param {Event} e 
     */
     imgLongPress(e) {
      var node = this.getNode(e.target.dataset.i)
      // 父级中有链接
      if (node.attrs.ignore)
        return
      const { x, y } = e.detail
      this.root.triggerEvent('imglongpress', Object.assign(node.attrs, {
        x,
        y
      }))
    },

    /**
     * @description 图片加载完成事件
     * @param {Event} e 
     */
    imgLoad(e) {
      const i = e.target.dataset.i
      // const width = e.detail.width || 0
      // const height = e.detail.height || 0
      // const ratio = width / height
      // this.setData({
      //   [`whwh.${i}`]: { w: width, h: height, r: ratio }
      // })
      const node = this.getNode(i)
      let val
      if (!node.w)
        val = e.detail.width
      // 加载完毕，取消加载中占位图
      else if ((this.properties.opts[1] && !this.data.ctrl[i]) || this.data.ctrl[i] == -1)
        val = 1
      if (val
        // #ifdef MP-TOUTIAO
        && val != this.data.ctrl[i]
        // #endif
      )
        this.setData({
          ['ctrl.' + i]: val
        })
    },

    /**
     * @description 链接点击事件
     * @param {Event} e 
     */
    linkTap(e) {
      var node = e.currentTarget ? this.getNode(e.currentTarget.dataset.i) : {},
        attrs = node.attrs || e,
        href = attrs.href
      this.root.triggerEvent('linktap', Object.assign({
        innerText: this.root.getText(node.children || []), // 链接内的文本内容
      }, attrs))
      if (href) {
        // 跳转锚点
        if (href[0] == '#')
          this.root.navigateTo(href.substring(1)).catch(() => { })
        // 复制外部链接
        else if (href.includes('://')) {
          if (this.root.properties.copyLink)
            wx.setClipboardData({
              data: href,
              success: () =>
                wx.showToast({
                  title: '链接已复制'
                })
            })
        }
        // 跳转页面
        else
          wx.navigateTo({
            url: href,
            fail() {
              wx.switchTab({
                url: href,
                fail() { }
              })
            }
          })
      }
    },

    /**
     * @description Tap an element
     * @param {Event} e 
     */
    elTap(e) {
      var node = this.getNode(e.currentTarget.dataset.i)
      this.root.triggerEvent('eltap', node.attrs)
    },

    /**
     * @description 错误事件
     * @param {Event} e 
     */
    mediaError(e) {
      var i = e.target.dataset.i,
        node = this.getNode(i)
      // 加载其他源
      if (node.name == 'video' || node.name == 'audio') {
        var index = (this.data.ctrl[i] || 0) + 1
        if (index > node.src.length)
          index = 0
        if (index < node.src.length)
          return this.setData({
            ['ctrl.' + i]: index
          })
      }
      // 显示错误占位图
      else if (node.name == 'img' && this.properties.opts[2])
        this.setData({
          ['ctrl.' + i]: -1
        })
      if (this.root)
        this.root.triggerEvent('error', {
          source: node.name,
          attrs: node.attrs,
          errMsg: e.detail.errMsg
        })
    }
  }
})
