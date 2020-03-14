(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{208:function(e,t,n){"use strict";n.r(t);var a=n(28),o=Object(a.a)({},(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("p",[e._v("看了一段时间React源码，主要是React Native实现的Virtual Dom树渲染更新部分。React版本是15.2.1，React Native版本是0.30.0。\n自己的第一个系列博客，梳理巩固所思所得。如果能对你有所助益，是更吼的了。")]),e._v(" "),n("p",[e._v("React实现了一套由数据到展示的渲染\b更新方案。数据存放在一个个节点中，最终的展示由节点组成的树决定。任何展示的更新都来源于数据的更新，即props或state的更新。\n")]),e._v(" "),n("hr"),e._v(" "),n("h2",{attrs:{id:"reactelement：节点类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reactelement：节点类"}},[e._v("#")]),e._v(" ReactElement：节点类")]),e._v(" "),n("p",[e._v("\b数据节点，以后简称element，存储了type、key、ref、props等内容。")]),e._v(" "),n("p",[e._v("render的作用就是生成element，是渲染的\b第一站。element\b保存了props而并没有state，因为state会在render方法内作为某个element的props存储在element中。")]),e._v(" "),n("hr"),e._v(" "),n("h2",{attrs:{id:"reactcomponent：外部组件类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reactcomponent：外部组件类"}},[e._v("#")]),e._v(" ReactComponent：外部组件类")]),e._v(" "),n("p",[e._v("开发中定义组件所写的类。“外部”可以理解为由开发人员使用的，相对的“内部”是指React内部实现\b渲染更新而使用的。其实例称为publicInstance。")]),e._v(" "),n("p",[e._v("可分为继承于React.Component的组件、纯函数组件两种。两者都实现了render方法，所以程序中任意界面无论多复杂，总\b能通过层层嵌套生成各级\belement。不同的是前者可维护state，并具备相应生命周期，这些定义将作用于React内部执行渲染更新。")]),e._v(" "),n("p",[e._v("ReactComponent具备setState和forState两个\b方法，两个方法的本质是在内部调用updater的相关方法\b压入待更新组件（在ReactUpdateQueue\b中详细介绍）。")]),e._v(" "),n("p",[n("em",[e._v("注释：\bReact中ReactComponent特指React.Component，我们这里把纯函数也\b算作一个特殊的ReactComponent，\b即外部\b组件类，便于后续理解。")])]),e._v(" "),n("h3",{attrs:{id:"总结为三点主要作用："}},[n("a",{staticClass:"header-anchor",attrs:{href:"#总结为三点主要作用："}},[e._v("#")]),e._v(" 总结为三点主要作用：")]),e._v(" "),n("ol",[n("li",[e._v("描述了渲染的树结构")]),e._v(" "),n("li",[e._v("维护了state")]),e._v(" "),n("li",[e._v("解释了在生命周期或事件触发时希望执行的内容")])]),e._v(" "),n("hr"),e._v(" "),n("h2",{attrs:{id:"reactcompositecomponent：内部组件类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reactcompositecomponent：内部组件类"}},[e._v("#")]),e._v(" \bReactCompositeComponent：内部组件类")]),e._v(" "),n("p",[e._v("React内部真正管理组件渲染和更新的类（\b手动划重点）。其实例为internalInstance的一种。")]),e._v(" "),n("p",[e._v("在RN中internalInstance有两种，分别是ReactCompositeComponent和ReactNativeBaseComponent的实例。")]),e._v(" "),n("p",[e._v("一个节点通常\b会经历\b挂载、更新、卸载三个生命阶段。\b节点树上的element，若其type是ReactComponent，则会在挂载时转化\b为ReactCompositeComponent实例。")]),e._v(" "),n("p",[e._v("实现了挂载、更新、卸载的\b方法，并负责在合适的时机触发生命周期方法。")]),e._v(" "),n("h3",{attrs:{id:"挂载：mountcomponent"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#挂载：mountcomponent"}},[e._v("#")]),e._v(" 挂载：mountComponent")]),e._v(" "),n("p",[e._v("返回值为markup，即本节点渲染的内容，在RN中是与Native渲染的真实View关联的一个ID。")]),e._v(" "),n("ol",[n("li",[e._v("生成ReactComponent的实例，存放于_instance。")]),e._v(" "),n("li",[e._v("执行componentWillMount")]),e._v(" "),n("li",[e._v("执行render获得一个element，存放于\b_renderedElement，\b根据element获得对应的internalInstance，存放于_renderedComponent，\b继续对其执行mountComponent，这样就完成了一次挂载过程中的向下解析。直至internalInstance是ReactNativeBaseComponent，就获得了与Native真实View关联的ID，作为markup\b递归返回。")]),e._v(" "),n("li",[e._v("将\bcomponentDidMount压入待执行队列")])]),e._v(" "),n("h3",{attrs:{id:"更新：updatecomponent"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#更新：updatecomponent"}},[e._v("#")]),e._v(" 更新：updateComponent")]),e._v(" "),n("ol",[n("li",[e._v("判断context更改或element的不同，触发\bcomponentWillReceiveProps。\b（props变化伴随着新element）")]),e._v(" "),n("li",[e._v("通过_pendingForceUpdate和shouldComponentUpdate决定是否更新。若更新，\b\b执行以下：")]),e._v(" "),n("li",[e._v("执行componentWillUpdate")]),e._v(" "),n("li",[e._v("执行render获得一个element，与之前的_renderedElement对比是否可以通过在旧组件上更新完成变动")]),e._v(" "),n("li",[e._v("若可以，对\b_renderedComponent继续执行updateComponent，完成了一次更新过程中的向下解析。")]),e._v(" "),n("li",[e._v("若不可以，卸载旧_renderedComponent，根据element实例化并挂载新的_renderedComponent，使用其返回的Markup对旧的进行替换")])]),e._v(" "),n("h3",{attrs:{id:"卸载：unmountcomponent"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#卸载：unmountcomponent"}},[e._v("#")]),e._v(" 卸载：unmountComponent")]),e._v(" "),n("ol",[n("li",[e._v("执行componentWillUnmount")]),e._v(" "),n("li",[e._v("对_renderedComponent继续unmountComponent，完成了一次卸载过程中的向下解析。")]),e._v(" "),n("li",[e._v("清空存储的各种5数据")])]),e._v(" "),n("hr"),e._v(" "),n("h2",{attrs:{id:"reactnativebasecomponent：rn中映射到native的组件类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#reactnativebasecomponent：rn中映射到native的组件类"}},[e._v("#")]),e._v(" ReactNativeBaseComponent：RN中映射到Native的组件类")]),e._v(" "),n("p",[e._v("真正会被Native渲染的组件\b类，通过UIManager将渲染内容传递给Native绘制。其实例为internalInstance的一种。")]),e._v(" "),n("p",[e._v("在RN中，所有的children的父节点都是ReactNativeBaseComponent（重点，理解树结构是如何解析的）。")]),e._v(" "),n("p",[e._v("实现了挂载、更新、卸载的\b方法，\b通过UIManager操作Native的UI，向下处理children的解析。")]),e._v(" "),n("h3",{attrs:{id:"挂载：mountcomponent-2"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#挂载：mountcomponent-2"}},[e._v("#")]),e._v(" 挂载：mountComponent")]),e._v(" "),n("p",[e._v("返回值为tag，与RN中真实的View关联。")]),e._v(" "),n("ol",[n("li",[e._v("UIManager.createView，通过tag关联创建Native\b的View，tag存储在_rootNodeID。")]),e._v(" "),n("li",[e._v("遍历children执行mountComponent，获得markup的数组(createTags)，UIManager.setChildren(containerTag, createTags)管tag关联，实现了Native中View的关联。")])]),e._v(" "),n("h3",{attrs:{id:"更新：updatechildren"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#更新：updatechildren"}},[e._v("#")]),e._v(" 更新：updateChildren")]),e._v(" "),n("ol",[n("li",[e._v("比较前后children里的element，\b对保留的旧节点执行updateComponent。")]),e._v(" "),n("li",[e._v("产生三种更新操作：移动（已有）、删除、插入（新建），并通过UIManager.manageChildren执行更新")])]),e._v(" "),n("h3",{attrs:{id:"卸载：unmountcomponent-2"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#卸载：unmountcomponent-2"}},[e._v("#")]),e._v(" 卸载：unmountComponent")]),e._v(" "),n("ol",[n("li",[e._v("遍历children执行unmountComponent")])]),e._v(" "),n("hr"),e._v(" "),n("p",[e._v("\b本节介绍了React中的几个基础类的概念，\b下节将它们串联起来。")])])}),[],!1,null,null,null);t.default=o.exports}}]);