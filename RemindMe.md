# 备忘

## to do
react-native-fs不再维护，需要用其它模块代替

## 注意
使用react-native-git-upgrade升级可能会让项目文件夹下某些文件丢失，需要提前做好备份

## 搭建程序会出现的问题

### react-native-fs
需要做一些设置，[详细](https://github.com/johanneslumpe/react-native-fs)

### jsdiff
需要自己安装babel-preset-es2015-mod，babel-preset-es3
但是**不要把它们添加到项目文件下的.babelrc文件里**

### 手机震动
需要取得手机权限
Note for android add <uses-permission android:name="android.permission.VIBRATE"/> to AndroidManifest.xml

### react-native-swipe-list-view
修改了SwipeRow.js
由于删除数据A后，跟着的数据B会处于数据A删除时的状态。故在SwipeRow.js中加了componentDidUpdate函数，重设数据B的状态

### 生成程序可能出现的问题

#### 1
问题:
```
Error:Execution failed for task ':app:processDebugResources'.

Java.io.IOException: Could not delete path '{...}\Android\app\build\generated\source\r\{...}
```
解决方法：进入项目文件夹下手动删除android\app\build文件夹内的所有文件后再次运行
