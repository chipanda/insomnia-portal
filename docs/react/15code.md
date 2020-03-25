---
title: React15源码解析
---


<!-- more -->
*******

重读React源码，15版本。为避免深入代码细节写成翻译代码，尽量不粘贴源码，从机理去还原React的代码思路，力求清晰易懂，便于记忆。

## React是什么

当我们构建一个网页时，所做的事情大体可以分为两种：根据数据创建视图、响应事件变更数据更新视图。在react、vue之类的mv*框架出现之前，为完成上述两个任务开发人员基本上依赖的是操作原生DOM，而这导致大部分的精力消耗在复杂的DOM操作上,而不是业务逻辑本身。

React提供了一种方案，使用标记性语言的方式声明视图，并在数据变更时自动更新视图，把复杂的DOM操作隐藏于框架内部，使我们可以专注于业务逻辑处理数据。

为在body下插入如下代码

```
<div>
  <span>hello world</span>
</div>
```

1、操作原生DOM实现

```
var parent = document.createElement('div');
var child = document.createElement('span');
child.textContent = 'hello world';
parent.appendChild(child);
document.body.appendChild(parent);
```

2、React实现

```
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'hello world',
    };
  }
  render() {
    return (
      <div>
        <span>{this.state.text}</span>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.body);
```

React使用JSX作为标记语言描述视图的树状结构，通过在render中使用`数据 + 树状结构`即可清晰的表达我们希望得到的视图。

那React是怎样把`数据 + 树状结构`转换为真实`html`内容的呢，下面进入正题。

## 挂载：从`数据 + 树状结构`到`html`

> 当我们把数据也作为树状结构中的一个节点，则树中的节点类型可以分为4类：

> 1. null、undefined、true、false
> 2. string或number
> 3. HTML定义的标签，如&lt;div&gt;、&lt;span&gt;、&lt;input/&gt;等
> 4. React自定义组件对应的标签，如上文&lt;App/&gt;。

 前3类很容易理解怎么转换为`html`，1、2类都不会具备子节点，1类可以直接忽略，2类则只需要按原内容插入到`html`。而`html`标签只要根据标签类型创建对应的dom节点，并将子节点转换为`html`后插入就可以了。

> JSX在解析树时会为其中的每个节点（一定包含在上述4种类型），创建一个ReactElement对象（1、2类除外，直接使用其值作为节点），存储一些必要的信息，如key、ref、props（props对象使用children存储其子节点）等。这个解析过程则是从ReactDOM.render(&lt;App/&gt;, xxx)的App作为根节点不断调用render向下完成的。

例子：

```
const A = (props) => (
  <div>
    {props.children}
    <div>One World One Dream</div>
  </div>
);
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'hello world',
    };
  }
  render() {
    return (
      <div>
        <A>{this.state.text}</A>
        <span>I am insomnia_x.</span>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.body);
```
对APP执行render解析后：
```
{
  type: App,
  props: {
    children: [
      {
        type: 'div',
        props: {
          children: [
            {
              type: A,
              children: [
                'hello world'
              ]
            },
            {
              type: 'span',
              children: [
                'I am insomnia_x.'
              ]
            }
          ]
        }
      }
    ]
  }
}
```
App自身解析到这里已经初步完成，因为A是自定义React组件，需要执行其render继续解析，则children将替换为
```
{
  type: App,
  props: {
    children: [
      {
        type: 'div',
        props: {
          children: [
            {
              type: A,
              children: [
                {
                  type: 'div',
                  children: [
                    'hello world',
                    {
                      type: 'div',
                      children: [
                        'One World One Dream'
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'span',
              children: [
                'I am insomnia_x.'
              ]
            }
          ]
        }
      }
    ]
  }
};
```
至此，每一个render都已经执行完。

> 实际上不是执行完所有render后获得一整颗ReactElement树然后再转成html。而是遵循以下步骤：

1、获得根节点ReactElement

2、判断当前节点类型，进行渲染，获得对应的dom对象

    2.1 属于 html 标签
        2.1.1、创建对应标签的dom对象
        2.1.2、遍历子节点（ReactElement）执行步骤2，获得所有子节点的生成的dom对象或字符串
        2.1.3、将子节点的dom对象作为child依次插入2.1.1创建的dom对象中
        2.1.4、返回2.1.1创建的dom对象
    2.2 属于 react 组件
        2.2.1、执行render获得子节点element
        2.2.2、对element执行步骤2，获得dom对象并返回
    2.3 属于 string 或者 number
        2.3.1 转换为字符串，返回（会作为文本节点插入到父节点dom对象中）
    2.4 属于 null、undefined、false、true
        2.4.1、实际上这里的值在其作为子节点2.1.2的遍历过程中通过优化过滤掉了。为简化理解，我们假设不过滤的情况，返回一个空字符串

3、返回根节点生成的DOM对象，将其插入到指定的container节点内。

> 归纳一下规律：

1、任意自定义React组件的渲染的结果是其通过render获得的最近一个根据html标签创建的dom对象。（实际上是以该dom对象为根节点的dom树；可能为null，则会被忽略）

2、在render从上到下的过程中，一组子节点的父节点一定是html标签类型，这组子节点各自渲染的dom对象或字符串作为子节点被插入到该标签创建的dom对象中。

> 通从从上到下的逐层解析，我们将React标记式描写的`数据 + 树状结构`转换为一颗dom树，将这颗dom树插入到指定的dom节点中，即完成了初次渲染。

## 更新

setState触发更新，分为两种情况：

- setState时未处于批处理更新事务中，会在内部开启一次批处理更新事务，并在setState方法执行完时事务完成。此时通过获取的state已经更新后最新的。
- setState时处于批处理更新事务中，此时setState执行完后批处理事务未结束，state在pengdingStates中未更新到组件state上，故此时获取的state依然是旧的。

为什么setState回调方法取到的state是最新的？

- 因为setState存在两个参数时（更新的state和callback），因为批处理更新事务中callback会在pengdingState更新到state上后才调用。


<!--  

## more

上述过程中我们只新增了一个概念：ReactElement。它存储了类型和其子节点等信息，并据此推导了React初次渲染的过程。

实际上在渲染过程中有更多的辅助对象：

### 一、内置组件对象

为了分类处理上述4种ReactElement类型的挂载逻辑、实现声明周期等功能还对应有4种组件类型：ReactDOMEmptyComponent、ReactDOMTextComponent、ReactDOMComponent、ReactCompositeComponent。

拥有render和生命周期的只有React组件，ReactCompositeComponent则内置了这些React组件的实例化、render调用、生命周期调用等控制逻辑。

### 二、渲染事务(ReactReconcileTransaction)

事务是React中特定的一种函数执行方式，设定wrappers数组（元素为包含initialize和close方法的对象）[A,B]，通过事务对象执行方法fn时，真实执行顺序为A.initialize->B.initialize->fn->A.close->B.close，类似于修饰器。

ReactReconcileTransaction的wrappers为[SELECTION_RESTORATION, EVENT_SUPPRESSION, ON_DOM_READY_QUEUEING]。

这里简述下ON_DOM_READY_QUEUEING的作用：

    1、initialize：将一个回调队列设置为空
    2、close：一次执行回调队列中的方法并清空

在上述的从上到下的渲染解析过程中，会向这个回调队列内push一些函数，比如调用ref将组件实例传入、触发组件的componentDidMount生命周期函数等。

### 三、批处理更新事务(ReactDefaultBatchingStrategyTransaction)

留待更新部分分析。

-->