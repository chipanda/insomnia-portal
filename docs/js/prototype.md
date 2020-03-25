## 原型链

### 1、原型链的元素：构造函数、原型、实例。原型链有一下特性：

> 特性1：每个构造函数都有一个原型对象（prototype）。

> 特性2：原型对象都包含一个指向构造函数的指针（constructor）。

> 特性3：实例都包含一个指向原型对象的内部指针（[[Prototype]]）。

### 2、所有引用类型都默认继承了Object，所有函数的默认原型都是Object的实例

> `Object.getPrototypeOf({}) === Object.prototype; //true`

> `Object.getPrototypeOf(Object.prototype) === null; // true`


## 函数的两面性：函数或对象

> `var Func = function(){}; //声明一个简单的方法`

> `var instance = new Func(); // 通过构造函数Func生成一个实例`

### 1、当函数作为构造函数时

> 基于特性1、3，Func实例的[[Prototype]]指向Func.prototype：

>> `Object.getPrototypeOf(new Func()) === Func.prototype; //true`

> 由Func实例instance向上的原型链经过Func.prototype(由Object生成的实例)、Object.prototype、null

>> `Object.getPrototypeOf(instance) === Func.prototype; //true`

>> `Object.getPrototypeOf(Func.prototype) === Object.prototype; //true`

>> `Object.getPrototypeOf(Object.prototype) === null; //true`

### 2、当函数作为对象时

> 函数作为对象看待时，它是由构造函数Function生成的一个实例。基于特性2、3：

>> `Object.getPrototypeOf(Func).constructor === Function; //true`

>> `Object.getPrototypeOf(Func) === Function.prototype; //true`

> 将Func看做Function实例向上的原型链经过Function.prototype、Object.prototype、null

>> `Object.getPrototypeOf(Func) === Function.prototype; //true`

>> `Object.getPrototypeOf(Function.prototype) === Object.prototype; //true`

>> `Object.getPrototypeOf(Object.prototype) === null; //true`

### 对比函数作为构造函数和函数对象时，虽然原型链最终都经过Object.prototype，但中间路径并不一样（Func.prototype和Function.prototype）。



## 寄生组合式继承

继承，面向对象（Object-Oriented）的三个基本特征之一（封装、多态）。目的为通过继承使子类具有父类的属性或方法。通过下列不同的继承方式，让我们逐步推导js的继承的最佳实践方案。

### 原型链继承

>通常面向对象中两种继承方式：接口继承和实现继承。接口继承只继承方法签名（定义了函数或方法的输入与输出，不提供实现），而js中函数没有签名，所以不能实现接口签名，只支持实现继承。

>实现继承则是依赖原型链完成的。

```
// 父类
var Super = function(name){
  this.name = name;
  this.friends = [];
}
Super.prototype.sayName = function(){
  return this.name;
};
Super.prototype.sayFriends = function(){
  return this.friends;
};

// 子类
var Sub = function() {
}
var super1 = new Super('John');
Sub.prototype = super1;

var sub1 = new Sub();
var sub2 = new Sub();

console.log(sub1.sayName()); // John
console.log(sub2.sayName()); // John

sub1.friends.push('Li');
console.log(sub1.sayFriends()); // ["Li"]
console.log(sub2.sayFriends()); // ["Li"]
```

>在sub1和sub2中都继承了Super实例的name、friends属性和sayName、sayFriends方法。但这里存在一个缺点，它们继承的是同一个实例，sub1在继承的引用类型的属性friends上做修改时，会同步到sub2，有时这并不是我们想要的。

### 借用构造函数继承

>为了解决上述问题，我们可用借用构造函数实现继承，通过在Sub的构造函数中执行Super方法时指定this，将属性从共享同一个实例转为每个实例独有。

```
// 父类
var Super = function(name){
  this.name = name;
  this.friends = [];

  this.sayName = function(){
    return this.name;
  };
  this.sayFriends = function(){
    return this.friends;
  };
}
// 子类
var Sub = function(name) {
  Super.call(this, name);
}

var sub1 = new Sub('John');
var sub2 = new Sub('John');

console.log(sub1.sayName()); // John
console.log(sub2.sayName()); // John

sub1.friends.push('Li');
console.log(sub1.sayFriends()); // ["Li"]
console.log(sub2.sayFriends()); // []
```

>这种继承方式不足的是虽然每个实例继承的属性不再共享了，但方法也不共享了，每创建一个实例就创建了一次sayName、sayFriends方法。通常我们希望方法是复用的，避免重复创建。

### 组合继承

>组合继承就是结合原型继承、借用构造函数继承两者的优点，达到在继承中属性不共享、方法复用的一种继承方式。

```
// 父类
var Super = function(name){
  this.name = name;
  this.friends = [];
}
Super.prototype.sayName = function(){
  return this.name;
};
Super.prototype.sayFriends = function(){
  return this.friends;
};

// 子类
var Sub = function(name) {
  // 借用构造函数继承
  Super.call(this, name);
}
// 原型继承
var super1 = new Super();
Sub.prototype = super1;

var sub1 = new Sub('John');
var sub2 = new Sub('John');

console.log(sub1.sayName()); // John
console.log(sub2.sayName()); // John

sub1.friends.push('Li');
console.log(sub1.sayFriends()); // ["Li"]
console.log(sub2.sayFriends()); // []

```

>仔细观察，为了在继承中复用方法，创建了super1的实例（即调用了Super方法），然后在创建Sub的实例时Sub中也再次调用了Super。第一次Super的执行其实是浪费的（特别是如果Super中执行的代码比较多时），平白创建了一个Super的实例。

>当我们只想继承Super的prototype上的方法时，将

```
// 原型继承
var super1 = new Super();
Sub.prototype = super1;
```
改造为：

```
var Mid = function(){};
Mid.prototype = Super.prototype;
var mid = new Mid();
Sub.prototype = mid;
```
>这样避免了Super的重复调用，虽然多调用了一次Mid，不过因为Mid是空函数，影响比较小。

>这时候也许你会有个疑问，为什么不直接写成

`Sub.prototype = Super.prototype;`

>让我们看下面代码：

```
var Super = function(){};
var Sub = function(){};
Sub.prototype = Super.prototype;

var sup = new Super();
var sub = new Sub();

console.log(sup instanceof Sub); // true;
console.log(sub instanceof Sub); // true;
```
>看到没，由Super创建的实例sup也会被识别为Sub的实例。而增加Mid的写法不会存在这个问题。

### 原形式继承

> 增加Mid的来继承的这种方式，被道格拉斯·克罗克福德归纳为原形式继承，并提出一个通用的函数：

```
//这里的F对应上文Mid，而参数o即Super.prototype，返回值对应mid。
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
```

>object方法是基于已有的对象创建新对象，而新对象通过原型继承了旧对象，适用于不关心新对象类型时使用。在ES5中新增的Object.create方法规范化了原形式继承。

### 寄生式继承

>寄生式继承是对原形式继承的一种拓展，即对object函数创建的对象进行某种增强后再返回，如：

```
function createAnother(o) {
  var clone = object(o);
  o.sayHello = function(){
    console.log('Hello!');
  };
  return clone;
}
```

### 寄生组合式继承

>将组合继承与寄生式继承结合，即寄生组合式继承

```
var inheritPrototype = function(subType, superType) {
  var prototype = Object.create(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}
var Super = function(name){
  this.name = name;
  this.friends = [];
}
Super.prototype.sayName = function(){
  return this.name;
};
Super.prototype.sayFriends = function(){
  return this.friends;
};

// 子类
var Sub = function(name) {
  Super.call(this, name);
}

inheritPrototype(Sub, Super);

var sub1 = new Sub('John');
var sub2 = new Sub('John');

console.log(sub1.sayName()); // John
console.log(sub2.sayName()); // John

sub1.friends.push('Li');
console.log(sub1.sayFriends()); // ["Li"]
console.log(sub2.sayFriends()); // []
```