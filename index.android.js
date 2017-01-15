/**
 *app name:透析单词
 *author:陈旺
 *1.00 finish date:2016-10-20
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  Text,
  View,
  ToastAndroid,
  BackAndroid,
} from 'react-native';

import AddFile from './lib/Components/AddFile';
import HomeScene from './lib/Components/HomeScene';
import InitScene from './lib/Components/InitScene';
import PracticeScene from './lib/Components/PracticeScene';
import SearchCoverImageScene from './lib/Components/SearchCoverImageScene';

class RoteVocabApp extends Component {

  render() {

    return (
      <View style={{flex:1}}>
        <Navigator
          initialRoute={{name: "init"}}
          renderScene={(route, navigator) => {
            switch(route.name){
              case "init":
                return <InitScene navigator={navigator} />
              case "homeScene":
                return <HomeScene db={route.db} navigator={navigator} />
              case "practiceScene" :
                return <PracticeScene db={route.db} navigator={navigator} />
              case "addFile" :
                return <AddFile navigator={navigator} />
              case "searchCoverImageScene" :
                return <SearchCoverImageScene navigator={navigator} itemName={route.itemName}/>
              default:
                //exit app
                ToastAndroid.show("程序出错，自动退出",ToastAndroid.LONG);
                BackAndroid.exitApp();
            }
          }}
          configureScene={(route, routeStack) => Navigator.SceneConfigs.FadeAndroid}
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('RoteVocabApp', () => RoteVocabApp);
