# 备忘

## to do when have time
- react-native-fs不再维护，需要用其它模块代替

## 3.1
### to do
- 写针对AsyncStorage和redux的测试文件
- 增加更改词集名字的功能

## 3.0
### to do
- 写针对AsyncStorage和redux的测试文件 (next)
- 使用react-native-share-extension接收其它app的share data (ok)
- 写CustomToolBar (ok)
- 增加更改词集名字的功能 (next)

### bug
- ContentsToDb里的提取文件名字的正则式可能有问题

## 2.3 
### to do
- DirView的ListView改为FlatList (ok)
- 保留词集名字setting (ok)
- 对DrawerView的样式，内容进行更改 (ok)
- 增加更改词集名字的功能 (next)
- SearchCoverImageScene的ListView改为FlatList (ok)
- 尽量以少更改react-native-swipe-list-view的代码为前提，写删除词条动画 (ok)
### bug
- 问题：屏幕翻转为横屏，点击TextInput会出现新的style，由于文字是白色与TextInput新样式的背景色是白色造成冲突。暂时怀疑和windowSoftInputMode有关。

  解决方法：把TextInput的disableFullscreenUI设置为false（和windowsSoftInputMode无关)

## 注意
使用react-native-git-upgrade升级可能会让项目文件夹下某些文件丢失，需要提前做好备份

## 搭建程序可能会出现的问题

### react-native-share-extension
需要做一些设置，[详细](https://github.com/alinz/react-native-share-extension)
由于分享界面需要透明的背景，需要在```styles.xml```上提供新的**theme**，添加内容如下
```xml
<style name="Transparent">
  <item name="android:windowIsTranslucent">true</item>
  <item name="android:windowAnimationStyle">@android:style/Animation.Translucent</item>
  <item name="android:windowBackground">@color/transparent</item>
  <item name="android:windowNoTitle">true</item>
  <!-- 安卓颜色表示方法 https://developer.android.com/reference/android/graphics/Color.html?hl=es -->
  <item name="android:textColor">#ff424242</item>
  <item name="android:editTextColor">#ff424242</item> 
</style>
```
然后在文件夹添加名为```color.xml```文件
```xml
<resources>
	<color name="transparent">#00000000</color>
</resources>
```

### react-native-fs
需要做一些设置，[详细](https://github.com/johanneslumpe/react-native-fs)

### jsdiff
需要自己安装babel-preset-es2015-mod，babel-preset-es3

但是**不要把它们添加到项目文件下的.babelrc文件里**

### 手机震动
需要取得手机权限
```
Note for android add <uses-permission android:name="android.permission.VIBRATE"/> to AndroidManifest.xml
```

### react-native-swipe-list-view
修改了SwipeRow.js

由于删除数据A后，跟着的数据B会处于数据A删除时的状态。故在SwipeRow.js中加了componentDidUpdate函数，重设数据B的状态

### 生成程序可能出现的问题

- 问题：

```java
Error:Execution failed for task ':app:processDebugResources'.

Java.io.IOException: Could not delete path '{...}\Android\app\build\generated\source\r\{...}
```
解决方法：进入项目文件夹下手动删除android\app\build文件夹内的所有文件后再次运行，或者不断运行`react-native run-android`



