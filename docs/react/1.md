---
title: React中的类
tags:
  - react
  - react-native
categories:
  - react
date: 2018-02-23 20:13:32
---

看了一段时间React源码，主要是React Native实现的Virtual Dom树渲染更新部分。React版本是15.2.1，React Native版本是0.30.0。
自己的第一个系列博客，梳理巩固所思所得。如果能对你有所助益，是更吼的了。

React实现了一套由数据到展示的渲染更新方案。数据存放在一个个节点中，最终的展示由节点组成的树决定。任何展示的更新都来源于数据的更新，即props或state的更新。
<!-- more -->
*******

## ReactElement：节点类      

数据节点，以后简称element，存储了type、key、ref、props等内容。

render的作用就是生成element，是渲染的第一站。element保存了props而并没有state，因为state会在render方法内作为某个element的props存储在element中。

******

## ReactComponent：外部组件类      

开发中定义组件所写的类。“外部”可以理解为由开发人员使用的，相对的“内部”是指React内部实现渲染更新而使用的。其实例称为publicInstance。   

可分为继承于React.Component的组件、纯函数组件两种。两者都实现了render方法，所以程序中任意界面无论多复杂，总能通过层层嵌套生成各级element。不同的是前者可维护state，并具备相应生命周期，这些定义将作用于React内部执行渲染更新。

ReactComponent具备setState和forState两个方法，两个方法的本质是在内部调用updater的相关方法压入待更新组件（在ReactUpdateQueue中详细介绍）。

*注释：React中ReactComponent特指React.Component，我们这里把纯函数也算作一个特殊的ReactComponent，即外部组件类，便于后续理解。*

### 总结为三点主要作用：    
    
1. 描述了渲染的树结构   
2. 维护了state    
3. 解释了在生命周期或事件触发时希望执行的内容    

*******

## ReactCompositeComponent：内部组件类        

React内部真正管理组件渲染和更新的类（手动划重点）。其实例为internalInstance的一种。

在RN中internalInstance有两种，分别是ReactCompositeComponent和ReactNativeBaseComponent的实例。

一个节点通常会经历挂载、更新、卸载三个生命阶段。节点树上的element，若其type是ReactComponent，则会在挂载时转化为ReactCompositeComponent实例。

实现了挂载、更新、卸载的方法，并负责在合适的时机触发生命周期方法。

### 挂载：mountComponent    
     
返回值为markup，即本节点渲染的内容，在RN中是与Native渲染的真实View关联的一个ID。    
1. 生成ReactComponent的实例，存放于_instance。    
2. 执行componentWillMount  
3. 执行render获得一个element，存放于_renderedElement，根据element获得对应的internalInstance，存放于_renderedComponent，继续对其执行mountComponent，这样就完成了一次挂载过程中的向下解析。直至internalInstance是ReactNativeBaseComponent，就获得了与Native真实View关联的ID，作为markup递归返回。    
4. 将componentDidMount压入待执行队列

### 更新：updateComponent
1. 判断context更改或element的不同，触发componentWillReceiveProps。（props变化伴随着新element）    
2. 通过_pendingForceUpdate和shouldComponentUpdate决定是否更新。若更新，执行以下：    
3. 执行componentWillUpdate 
4. 执行render获得一个element，与之前的_renderedElement对比是否可以通过在旧组件上更新完成变动
5. 若可以，对_renderedComponent继续执行updateComponent，完成了一次更新过程中的向下解析。  
6. 若不可以，卸载旧_renderedComponent，根据element实例化并挂载新的_renderedComponent，使用其返回的Markup对旧的进行替换

### 卸载：unmountComponent
1. 执行componentWillUnmount 
2. 对_renderedComponent继续unmountComponent，完成了一次卸载过程中的向下解析。 
3. 清空存储的各种5数据

********

## ReactNativeBaseComponent：RN中映射到Native的组件类     

真正会被Native渲染的组件类，通过UIManager将渲染内容传递给Native绘制。其实例为internalInstance的一种。

在RN中，所有的children的父节点都是ReactNativeBaseComponent（重点，理解树结构是如何解析的）。

实现了挂载、更新、卸载的方法，通过UIManager操作Native的UI，向下处理children的解析。

### 挂载：mountComponent    
    
返回值为tag，与RN中真实的View关联。    
1. UIManager.createView，通过tag关联创建Native的View，tag存储在_rootNodeID。 
2. 遍历children执行mountComponent，获得markup的数组(createTags)，UIManager.setChildren(containerTag, createTags)管tag关联，实现了Native中View的关联。

### 更新：updateChildren
1. 比较前后children里的element，对保留的旧节点执行updateComponent。
2. 产生三种更新操作：移动（已有）、删除、插入（新建），并通过UIManager.manageChildren执行更新

### 卸载：unmountComponent
1. 遍历children执行unmountComponent 

*******

本节介绍了React中的几个基础类的概念，下节将它们串联起来。




