---
title: 进阶版decorator，为class箭头函数添加装饰器
---

## 前言

本篇共3个章节。

前2个章节介绍class中两种方式定义方法的不同、decorator如何作用于class的方法。

最后1个章节通过一个demo介绍了如何实现一个兼容class普通方法和class属性方法的装饰器，以及如何保留装饰器装饰的箭头函数式中this为类实例的特性。

## 一、class中的函数

在React中的函数中固定this指向组件实例是一个常见的需求，通常有以下三种写法：

1.在constructor中使用bind指定this:

<pre><code>
  this.handlePress = this.handlePress.bind(this)
</code></pre>

2.使用autobind的装饰器:

<pre><code>
  @autobind
  handlePress(){}
</code></pre>

3.使用class properties与arrow function

<pre><code>
  handlePress = () => {}
</code></pre>

这里有两种为类声明方法的方式，第一种如1、2在类中直接声明方法，第二种为将方法声明为类的一个属性（’=‘标识）。

我们都知道class即function，让我们定义一个简单的类，观察babel编译后的结果，看看这两种方式声明的方法有何不同。

<pre><code>
  class A {
    sayHello() {
    }
    sayWorld = function() {
    }
  }
</code></pre>

编译后

<pre><code>
  var A = function () {
      function A() {
          _classCallCheck(this, A);
  
          this.sayWorld = function () {};
      }
  
      _createClass(A, [{
          key: "sayHello",
          value: function sayHello() {}
      }]);
  
      return A;
  }();
</code></pre>


编译后的代码中sayHello和sayWorld是通过不同方式关联到A上的。sayWorld的定义发生在构造函数执行期间，即类实例的创建时。而sayHello是通过_createClass方法关联到A上的。

来看看_createClass做了什么：

<pre><code>
  var _createClass = function () {
    function defineProperties(target, props) { 
      for (var i = 0; i < props.length; i++) { 
        // 创建一个数据属性，并将其定义在target对象上
        var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; 
        descriptor.configurable = true; 
        if ("value" in descriptor) descriptor.writable = true; 
        Object.defineProperty(target, descriptor.key, descriptor); 
      } 
    } 
    return function (Constructor, protoProps, staticProps) { 
      if (protoProps) defineProperties(Constructor.prototype, protoProps); 
      if (staticProps) defineProperties(Constructor, staticProps); 
      return Constructor;
    }; 
  }();
</code></pre>

_createClass中创建了一个如下的数据属性，使用Object.defineProperty定义在A.prototype上。
<pre><code>
{
  enumerable: false,
  configurable: true,
  writable: true,
  value: function sayHello() {}
}
</code></pre>

可见sayHello方法是定义在A.prototype上的方法，会被众多A的实例所共享；而sayWorld则是每个A实例独有的方法（每次创建实例都会新建）。

#### 得出结论：

1、普通的类方法实际归属于class.prototype，该类的众多实例将通过原型链共享该方法。

2、属性方式定义的类方法归属于class的实例，同名方法在类的不同实例中并不相同。

&nbsp;

让我们对A做一些修改，重新编译。

<pre><code>
  class A {
    sayHello() {
      console.log('hello', this);
    }
    sayWorld = function() {
      console.log('world', this);
    }
    sayName = () => {
      console.log('name', this);
    }
  }
</code></pre>

编译后

<pre><code>
  var A = function () {
    function A() {
      var _this = this;
  
      _classCallCheck(this, A);
  
      this.sayWorld = function () {
        console.log('world', this);
      };
  
      this.sayName = function () {
        console.log('name', _this);
      };
    }
  
    _createClass(A, [{
      key: 'sayHello',
      value: function sayHello() {
        console.log('hello', this);
      }
    }]);
  
    return A;
  }();
</code></pre>

我们都知道箭头函数中this的指向为其声明时当前作用域的this，所以sayName中的this在编译过程中被替换为_this（构造函数执行时的this，即类实例本身），这就是前面固定方法this指向实例的第三种方法"使用class properties与arrow function"生效的原因。

## 二、decorator

装饰器(decorator)是一个函数，用于改造类与类的方法。篇幅原因我们这里只介绍作用于类方法的装饰器。一个简单的函数装饰器构造如下：

<pre><code>
function decoratorA(target, name, descriptor) {
  // 未做任何修改
}
</code></pre>

- target为class.prototype。

- name即方法名称。

- descriptor有两种，数据属性和访问器属性。两种属性包含了6种特性，enumerable和configurable为共有的2种特性，writable和value为数据属性独有，而getter和setter为访问器属性独有。

看一个简单的例子：

<pre><code>
  function decoratorA() {}
  function decoratorB() {}
  class A {
    @decoratorA
    @decoratorB
    sayHello() {
    }
  }
</code></pre>

编译后

<pre><code>
  function decoratorA() {}
  function decoratorB() {}
  var A = (_class = function () {
    function A() {
      _classCallCheck(this, A);
    }
  
    _createClass(A, [{
      key: "sayHello",
      value: function sayHello() {}
    }]);
  
    return A;
  }(), (_applyDecoratedDescriptor(_class.prototype, "sayHello", [decoratorA, decoratorB], Object.getOwnPropertyDescriptor(_class.prototype, "sayHello"), _class.prototype)), _class);
</code></pre>

与之前一样sayHello定义为A.prototype的属性，而后执行_applyDecoratedDescriptor应用装饰器decoratorA和decoratorB。

来看看_applyDecoratedDescriptor做了什么：

<pre><code>
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;
  
    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }
    // 以上为初始化一个数据属性（initializer不属于上文提到的6种属性特性，第三节详述其作用）
    
    // 本例中此处desc为{ enumerable: false, configurable: true, writable: true, value: function sayHello() {} }
  
    // 此处的reverse表明装饰器将按照距离sayHello由近及远的顺序执行，即先应用decoratorB再应用decoratorA
    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      // 装饰器执行，可在装饰器内部按需修改desc
      return decorator(target, property, desc) || desc;
    }, desc);
    // 本例中无initializer不执行此段代码
    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }
  
    if (desc.initializer === void 0) {
      // 将装饰器处理后的desc定义到target即A.prototype上
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }
    // 返回null
    return desc;
  }
</code></pre>

通过上述代码分析我们认识到：

1、装饰器的执行发生在类创建后，此时并无实例

2、依照距离函数由近及远执行

3、通过修改被装饰方法的属性特性，可以实现我们所需的功能（例如autobind-decorator实现绑定this）。

## 三、当class properties遇到decorator

decorator是es7纳入规范的js特性，而class properties目前是stage3阶段（截止2018.11.23）的提案，还没有正式纳入ECMAScript。

一个属性方法的特点是其创建在实例生成阶段（构造函数中），而装饰器的执行是在类创建后（实例生成前），这里就发生了一个概念上的小冲突，装饰器执行时属性方法似乎还没创建。那装饰器是如何装饰一个属性方法的呢，让我们到代码中找出答案。

<pre><code>
  function decoratorA() {}
  class A {
    @decoratorA
    sayName = () => {
      console.log(this);
    }
  }
</code></pre>

编译后

<pre><code>
  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  function decoratorA() {}
  var A = (_class = function A() {
    _classCallCheck(this, A);
  
    _initDefineProp(this, "sayName", _descriptor, this);
  }, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "sayName", [decoratorA], {
    enumerable: true,
    initializer: function initializer() {
      var _this = this;
  
      return function () {
        console.log(_this);
      };
    }
  })), _class);
</code></pre>

#### 简单的描述：

1、通过initializer来记录并标识类的属性方法

2、_applyDecoratedDescriptor创建返回了一个属性的描述对象_descriptor

3、在构造函数中通过_initDefineProp将_descriptor定义到实例this上（属性方法依然归属于实例，而不是class.prototype）


#### 从_initDefineProp逆推，有2个关键点需要注意：

1、_applyDecoratedDescriptor需返回一个包含initializer的descriptor，以确保属性的value是通过initializer调用初始化

2、装饰器在处理descriptor时，返回的descriptor需包含initializer，而不是数据属性或访问器属性格式的descriptor.

#### 实现一个兼容普通类函数和类属性函数的装饰器（保留箭头函数的this绑定）

需求：检查登录状态的装饰器，当装饰器修饰的方法调用时，检查登录状态。若已登录则执行该方法，若未登录，则执行一个指定方法提示需登录。

<pre><code>
  // 登录状态
  let logined = true;
  function checkLoginStatus() {
    return new Promise((resolve) => {
      resolve(logined);
      // 每次返回登录状态后对登录状态取反
      logined = !logined;
    });
  }
  // 提示需要登录
  function notice(target, tag) {
    console.log(tag, this === target, 'Need Login!');
  }
  // 检查登录状态的装饰器
  function checkLogin(notLoginCallback) {
    return function decorator(target, name, descriptor) {
      // 方法为类属性方法
      if (descriptor.initializer) {
        const replaceInitializer = function replaceInitializer() {
          const that = this;
          // 此处传入了指向类实例的this
          const fn = descriptor.initializer.call(that);
          return function replaceFn(...args) {
            checkLoginStatus().then((login) => {
              if (login) {
                return fn.call(this, ...args);
              }
              return notLoginCallback.call(this, ...args);
            });
          };
        };
        return {
          enumerable: true,
          configurable: true,
          writable: true,
          initializer: replaceInitializer,
        };
      }
      // 普通的类方法
      const originFn = descriptor.value;
      const replaceFn = function replaceFn(...args) {
        const that = this;
        checkLoginStatus().then((login) => {
          if (login) {
            return originFn.call(that, ...args);
          }
          return notLoginCallback.call(that, ...args);
        });
      };
      return {
        enumerable: true,
        configurable: true,
        writable: true,
        value: replaceFn,
      };
    }
  }
  
  class A {
    constructor() {
      this.printA2 = this.printA2.bind(this);
    }
    printA1(target, tag) {
      console.log(tag, this === target);
    }
    @checkLogin(notice)
    printA2(target, tag) {
      console.log(tag, this === target);
    }
    printB1 = function(target, tag) {
      console.log(tag, this === target);
    }
    @checkLogin(notice)
    printB2 = function(target, tag) {
      console.log(tag, this === target);
    }
    printC1 = (target, tag) => {
      console.log(tag, this === target);
    }
    @checkLogin(notice)
    printC2 = (target, tag) => {
      console.log(tag, this === target);
    }
  }
  
  const a = new A();
  a.printA1(a, 1);        // 1 true
  (0, a.printA1)(a, 2);   // 2 false
  a.printA2(a, 3);        // 3 true 
  (0, a.printA2)(a, 4);   // 4 true 'Need Login!'
  a.printB1(a, 5);        // 5 true
  (0, a.printB1)(a, 6);   // 6 false
  a.printB2(a, 7);        // 7 true
  (0, a.printB2)(a, 8);   // 8 false 'Need Login!'
  a.printC1(a, 9);        // 9 true
  (0, a.printC1)(a, 10);  // 10 true
  a.printC2(a, 11);       // 11 true
  (0, a.printC2)(a, 12);  // 12 true 'Need Login!'
</code></pre>

### 结果：

1、应用了checkLogin装饰器的普通类方法printA2可以使用bind绑定this指向a。

2、箭头函数this均保持指向了实例a。

3、应用了checkLogin装饰器的方法连续两次调用输出的登录状态相反，符合预期的装饰器效果。

&nbsp;

如果读到这里，希望你能有所收获~