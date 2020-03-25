## 深拷贝

值类型不存在拷贝，当提到拷贝时，特指的应该是引用类型即对象。

浅拷贝，即将一个对象的属性值复制到一个新对象。若对象属性的值是引用类型，不创建新的对象替换。

深拷贝，即将浅拷贝对象的所有引用类型属性值对替换为新对象（特殊case除外，如Function），我们这里只讨论Object和Array类型两种引用类型（因拷贝通常用于数据传递）。

### 一、利用JSON转换

`var copy = JSON.parse(JSON.stringify(origin));`

>使用时需注意：

>>1、origin中存在循环引用时会报错

>>2、以Symbol为key的属性会被忽略

>>3、undefined、函数及symbol值在序列化时会被忽略丢失（当值为对象的属性值）或被处理成null（当值为数组元素）

>>4、Set、Map及Buffer(nodejs)类型会被转为空对象{}

>>5、原对象的不同属性值指向同一个对象时，拷贝后不再相等

### 二、简单深拷贝

此版本解决了JSON转换的2、3问题：

>以Symbol为key的属性会被忽略

>undefined、函数及symbol值在序列化时会被忽略丢失（当值为对象的属性值）或被处理成null（当值为数组元素）

```
function cloneDeep(o) {
  if(o === null || typeof o !== 'object') {
    return o;
  }
  var copyO = o instanceof Array ? [] : {};
  var keys = Reflect.ownKeys(o);
  for(var i = 0; i < keys.length; i+=1) {
    var key = keys[i];
    var value = o[key];
    if (o && typeof value === 'object') {
      copyO[key] = cloneDeep(value);
    } else {
      copyO[key] = value;
    }
  }
  return copyO;
}

var symbol1 = Symbol('a');
var symbol2 = Symbol('b');
var origin = {
  a: symbol1,
  [symbol2]: 'b',
  c: undefined,
  sayHello() {
    console.log('Hello');
  }
};
var objCopy = cloneDeep(origin);

console.log(Object.keys(objCopy)); // ["a", "c", "sayHello"]，Object.keys只能遍历可枚举属性
console.log(objCopy[symbol2]); // b，通过Reflect.ownKeys获得到了不可枚举属性symbol2，并完成了复制
console.log(objCopy.a === origin.a); // true
objCopy.sayHello(); // Hello

var arr = [undefined, symbol1, function(){ console.log('world')}];
var arrCopy = cloneDeep(arr);

console.log(arrCopy); // [undefined, Symbol(a), ƒ]
arrCopy[2](); // world
```

### 三、拷贝Set和Map

增加类型判断，修改后如下：

```
var cloneDeep = function(){
  function cloneSet(set) {
    var copy = new Set();
    set.forEach(function(value) {
      copy.add(cloneBase(value));
    });
    return copy;
  };
  function cloneMap (map) {
    var copy = new Map();
    map.forEach(function(value, key) {
      copy.set(key, cloneBase(value));
    })
    return copy;
  }
  function cloneArray (arr) {
    var copy = [];
    for (var i=0; i<arr.length; i+=1) {
      copy.push(cloneBase(arr[i]));
    }
    return copy;
  }
  function cloneObject (obj) {
    var copy = {};
    var keys = Reflect.ownKeys(obj);
    for(var i = 0; i < keys.length; i+=1) {
      var key = keys[i];
      var value = obj[key];
      copy[key] = cloneBase(value);
    }
    return copy;
  }
  function cloneBase(o)  {
    if(o === null || typeof o !== 'object') {
      return o;
    }
    var copy = null;
    if (o instanceof Set) {
      copy = cloneSet(o);
    } else if (o instanceof Map) {
      copy = cloneMap(o);
    } else if (o instanceof Array) {
      copy = cloneArray(o);
    } else {
      copy = cloneObject(o);
    }
    return copy;
  }
  return cloneBase;
}();
```

### 四、解决JSON中1、5问题

为解决循环引用和属性值为相同对象拷贝后不想等，当我们再拷深拷贝时，如遇到已经拷贝的对象，则不再拷贝，而使用已有的拷贝对象替换即可。

```
var cloneDeep = function(){
  function cloneSet(origin, existObjMap) {
    if (existObjMap.has(origin)) {
      return existObjMap.get(origin);
    }
    var copy = new Set();
    existObjMap.set(origin, copy);

    origin.forEach(function(value) {
      copy.add(cloneBase(value, existObjMap));
    });
    return copy;
  };
  function cloneMap (origin, existObjMap) {
    if (existObjMap.has(origin)) {
      return existObjMap.get(origin);
    }
    var copy = new Map();
    existObjMap.set(origin, copy);

    origin.forEach(function(value, key) {
      copy.set(key, cloneBase(value, existObjMap));
    })
    return copy;
  }
  function cloneArray (origin, existObjMap) {
    if (existObjMap.has(origin)) {
      return existObjMap.get(origin);
    }
    var copy = [];
    existObjMap.set(origin, copy);

    for (var i=0; i<origin.length; i+=1) {
      copy.push(cloneBase(origin[i], existObjMap));
    }
    return copy;
  }
  function cloneObject (origin, existObjMap) {
    if (existObjMap.has(origin)) {
      return existObjMap.get(origin);
    }
    var copy = {};
    existObjMap.set(origin, copy);

    var keys = Reflect.ownKeys(origin);
    for(var i = 0; i < keys.length; i+=1) {
      var key = keys[i];
      var value = origin[key];
      copy[key] = cloneBase(value, existObjMap);
    }
    return copy;
  }
  function cloneBase(origin, existObjMap)  {
    if(origin === null || typeof origin !== 'object') {
      return origin;
    }
    // 如果该对象已经拷贝过，直接返回拷贝值
    if (existObjMap.has(origin)) {
      return existObjMap.get(origin);
    }
    var copy = null;
    if (origin instanceof Set) {
      copy = cloneSet(origin, existObjMap);
    } else if (origin instanceof Map) {
      copy = cloneMap(origin, existObjMap);
    } else if (origin instanceof Array) {
      copy = cloneArray(origin, existObjMap);
    } else {
      copy = cloneObject(origin, existObjMap);
    }

    return copy;
  }

  return function cloneDeep(origin) {
    var existObjMap = new Map();
    var copy = cloneBase(origin, existObjMap);
    existObjMap.clear();
    return copy;
  };
}();
```

### 五、测试

```
// 1、拷贝非对象的值类型：undefined、Symbol、number、string、boolean、null（对象）
function copySimpleValue() {
  try {
    var flag = true;
    if (cloneDeep(undefined) !== undefined) {
      flag = 'undefined';
    }
    var symbol = Symbol('aaa');
    if (cloneDeep(symbol) !== symbol) {
     flag = 'symbol';
    }
    if (cloneDeep(5) !== 5) {
      flag = 'number';
    }
    if (cloneDeep('string') !== 'string') {
      flag = 'string';
    }
    if (cloneDeep(true) !== true) {
      flag = 'true';
    }
    if (cloneDeep(false) !== false) {
      flag = 'false';
    }
    if (cloneDeep(null) !== null) {
      flag = 'null';
    }

    if (flag === true) {
      console.log('成功：拷贝非对象的值类型');
    } else {
      console.log('失败：拷贝非对象的值类型', flag);
    }
  } catch(e) {
    console.log('失败：拷贝非对象的值类型', e);
  }
}
// 2、拷贝简单对象
function copySimpleObject() {
  try {
    var flag = true;
    var obj = {
      name: 'Panda',
      age: 11,
    }
    var copy = cloneDeep(obj);

    if (copy === obj) {
      flag = false;
    }
    if (copy.name !== obj.name) {
      flag = false;
    }
    if (copy.age !== obj.age) {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝简单对象');
    } else {
      console.log('失败：拷贝简单对象');
    }
  } catch(e) {
    console.log('失败：拷贝简单对象', e);
  }
}
// 3、拷贝简单数组
function copySimpleArray() {
  try {
    var flag = true;
    var arr = [1,'a',true, false,null];
    var copy = cloneDeep(arr);

    if (arr === copy) {
      flag = false;
    }
    arr.forEach(function(val, index) {
      if (copy[index] !== val) {
        flag = false
      }
    });

    if (flag === true) {
      console.log('成功：拷贝简单数组');
    } else {
      console.log('失败：拷贝简单数组');
    }
  } catch(e) {
    console.log('失败：拷贝简单数组', e);
  }
}
// 4、拷贝简单Set
function copySimpleSet() {
  try {
    var flag = true;
    var symbol = Symbol('2');
    var set = new Set();
    set.add(1);
    set.add('a');
    set.add(true);
    set.add(false);
    set.add(null);
    set.add(undefined);
    set.add(symbol);
    var copy = cloneDeep(set);

    if (copy === set) flag = false;
    set.forEach(function(value) {
      if (!copy.has(value)) {
        flag = false;
      }
    })

    if (flag === true) {
      console.log('成功：拷贝简单Set');
    } else {
      console.log('失败：拷贝简单Set');
    }
  } catch(e) {
    console.log('失败：拷贝简单Set', e);
  }
}
// 5、拷贝简单Map
function copySimpleMap() {
  try {
    var flag = true;
    var symbol = Symbol(2);
    var map = new Map();
    map.set(1,symbol);
    map.set('a',2);
    map.set('b', true);
    map.set(true, 'c');
    map.set(false, undefined);
    map.set(undefined, null);
    var copy = cloneDeep(map);

    if (copy === map) flag = false;
    map.forEach(function(value, key) {
      if (copy.get(key) !== value) {
        flag = false;
      }
    })

    if (flag === true) {
      console.log('成功：拷贝简单Map');
    } else {
      console.log('失败：拷贝简单Map');
    }
  } catch(e) {
    console.log('失败：拷贝简单Map', e);
  }
}
// 6、拷贝多层数组
function copyArrayWithMultiLevel() {
  try {
    function checkArr(origin, copy) {
      var flag = true;
      if (origin === copy) flag = false;
      origin.forEach(function(value, index) {
        if (value instanceof Array) {
          flag = flag && checkArr(value, copy[index]);
        } else if (value !== copy[index]) {
          flag = false;
        }
      })
      return flag;
    }
    var flag = true;
    var arr = [1,2,3[4,5,6],true,[false,[7,[8,9]]]];
    var copy = cloneDeep(arr);

    if (copy === arr) flag = false;

    flag = flag && checkArr(arr, copy);

    if (flag === true) {
      console.log('成功：拷贝多层数组');
    } else {
      console.log('失败：拷贝多层数组');
    }
  } catch(e) {
    console.log('失败：拷贝多层数组', e);
  }
}
// 7、拷贝数组中包含对象
function copyArrayWithObject() {
  try {
    var flag = true;
    var arr = [{age:1}];
    var copy = cloneDeep(arr);
    if (copy === arr) {
      flag = false;
    }
    if (copy[0] === arr[0]) {
      flag = false;
    }
    if (copy[0].age !== arr[0].age) {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝数组中包含对象');
    } else {
      console.log('失败：拷贝数组中包含对象');
    }
  } catch(e) {
    console.log('失败：拷贝数组中包含对象', e);
  }
}
// 8、拷贝数组中包含函数、Set、Map、undefined、Symbol
function copyArrayWithSpecialValue() {
  try {
    var flag = true;
    var set = new Set();
    set.add(1);
    var map = new Map();
    map.set(1,2);
    var symbol = Symbol('a');
    var arr = [set,map,undefined,symbol];
    var copy = cloneDeep(arr);
    
    if (copy === arr) {
      flag = false;
    }
    if (copy[0] === set) {
      flag = false;
    }
    if (copy[1] === map) {
      flag = false;
    }
    if (copy[2] !== undefined) {
      flag = false;
    }
    if (copy[3] !== symbol) {
      flag = false;
    }
    if (!copy[0].has(1)) {
      flag = false;
    }
    if (copy[1].get(1) !== 2) {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝数组中包含函数、Set、Map、undefined、Symbol');
    } else {
      console.log('失败：拷贝数组中包含函数、Set、Map、undefined、Symbol');
    }
  } catch(e) {
    console.log('失败：拷贝数组中包含函数、Set、Map、undefined、Symbol', e);
  }
}
// 9、拷贝对象的属性值包含函数、Set、Map、undefined、Symbol
function copyObjectWithSpecialValue() {
  try {
    var flag = true;
    var set = new Set();
    set.add(1);
    var map = new Map();
    map.set(1,2);
    var symbol = Symbol('a');

    var obj = {
      a: set,
      b: map,
      c: symbol,
      d: undefined,
      e: function() {},
    };
    var copy = cloneDeep(obj);

    if (copy === obj) {
      flag = false
    }
    if (copy.a === set) {
      flag = false
    }
    if (copy.b === map) {
      flag = false
    }
    if (copy.c !== symbol) {
      flag = false
    }
    if (copy.d !== undefined) {
      flag = false
    }
    if (copy.e !== obj.e) {
      flag = false
    }
    if (!copy.a.has(1)) {
      flag = false
    }
    if (copy.b.get(1) !== 2) {
      flag = false
    }
    if (Object.keys(copy).indexOf['d'] === -1) {
      flag = false
    }
    if (typeof copy.e !== 'function') {
      flag = false
    }

    if (flag === true) {
      console.log('成功：拷贝对象的属性值包含函数、Set、Map、undefined、Symbol');
    } else {
      console.log('失败：拷贝对象的属性值包含函数、Set、Map、undefined、Symbol');
    }
  } catch(e) {
    console.log('失败：拷贝对象的属性值包含函数、Set、Map、undefined、Symbol', e);
  }
}
// 10、拷贝对象的key为Symbol
function copyObjectWithSymbolKey() {
  try {
    var flag = true;
    var symbol = Symbol(1);
    var obj = {
      [symbol]: 'a',
    };
    var copy = cloneDeep(obj);

    if (copy === obj) {
      flag = false
    }
    if (copy[symbol] !== 'a') {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝对象的key为Symbol');
    } else {
      console.log('失败：拷贝对象的key为Symbol');
    }
  } catch(e) {
    console.log('失败：拷贝对象的key为Symbol', e);
  }
}
// 11、拷贝Set中包含对象
function copySetWithObjectValue() {
  try {
    var flag = true;
    var set = new Set();
    var obj = {
      name: 'Panda',
    };
    set.add(obj);
    var copy = cloneDeep(set);

    if (copy === set) {
      flag = false;
    }
    if (copy.has(obj)) {
      flag = false;
    }
    for (var item of copy) {
      if (item.name !== obj.name) {
        flag = false;
      }
    }

    if (flag === true) {
      console.log('成功：拷贝Set中包含对象');
    } else {
      console.log('失败：拷贝Set中包含对象');
    }
  } catch(e) {
    console.log('失败：拷贝Set中包含对象', e);
  }
}
// 12、拷贝Map中key为对象、Symbol、函数
function copyMapWithSpecialKey() {
  try {
    var flag = true;
    var map = new Map();
    var obj = {age: 1};
    var symbol = Symbol(1);
    var func = function(){};
    map.set(obj,1);
    map.set(symbol,2);
    map.set(func,3);
    var copy = cloneDeep(map);

    if (copy === map) {
      flag = false;
    }
    if (copy.get(obj) !== 1) {
      flag = false;
    }
    if (copy.get(symbol) !== 2) {
      flag = false;
    }
    if (copy.get(func) !== 3) {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝Map中key为对象、Symbol、函数');
    } else {
      console.log('失败：拷贝Map中key为对象、Symbol、函数');
    }
  } catch(e) {
    console.log('失败：拷贝Map中key为对象、Symbol、函数', e);
  }
}
// 13、拷贝包含循环引用的对象
function copuObjectWithCircleReference() {
  try {
    var flag = true;
    var obj = {
      name: 'circle'
    };
    obj.key = obj;
    var copy = cloneDeep(obj);

    if (copy === obj) {
      flag = false;
    }
    if (copy.key !== copy) {
      flag = false;
    }
    if (copy.name !== 'circle') {
      flag = false;
    }

    if (flag === true) {
      console.log('成功：拷贝包含循环引用的对象');
    } else {
      console.log('失败：拷贝包含循环引用的对象');
    }
  } catch(e){
    console.log('失败：拷贝包含循环引用的对象', e);
  }
}
// 14、原始对象属性值为相同对象在拷贝后保持一致
function copuObjectWithSameReference() {
  try {
    var flag = true;
    var a = {
      key: 'a',
    };
    var obj = {
      a: a,
      b: a,
    };
    var copy = cloneDeep(obj);
    if (copy === obj) {
      flag = false
    }
    if (copy.a !== copy.b) {
      flag = false
    }
    if (copy.a.key !== obj.a.key) {
      flag = false
    }

    if (flag === true) {
      console.log('成功：原始对象属性值为相同对象在拷贝后保持一致');
    } else {
      console.log('失败：原始对象属性值为相同对象在拷贝后保持一致');
    }
  } catch(e){
    console.log('失败：原始对象属性值为相同对象在拷贝后保持一致', e);
  }
}

// test
try {
  copySimpleValue();
  copySimpleObject();
  copySimpleArray();
  copySimpleSet();
  copySimpleMap();
  copyArrayWithMultiLevel();
  copyArrayWithObject();
  copyArrayWithSpecialValue();
  copyObjectWithSpecialValue();
  copyObjectWithSymbolKey();
  copySetWithObjectValue();
  copyMapWithSpecialKey();
  copuObjectWithCircleReference();
  copuObjectWithSameReference();
} catch(e) {
  console.log('Something is wrong!', e);
}
```