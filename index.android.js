/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  ToastAndroid,
  Linking,
  View
} from 'react-native';

import AddFile from './lib/Components/AddFile';
import HomeScene from './lib/Components/HomeScene';
import InitScene from './lib/Components/InitScene';
import PracticeScene from './lib/Components/PracticeScene';

class RoteVocabApp extends Component {



  render() {
         
    return (
      <View style={{flex:1}}>
        {/*<StatusBar
          //backgroundColor='#1976D2'
          ref={(statusBarRef)=> this.statusBarRef = statusBarRef}
        />*/}
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
              default:
            }
          }}
          configureScene={(route, routeStack) => Navigator.SceneConfigs.FadeAndroid}
        />
      </View>
    );
  }

  /*componentDidMount(){
    StatusBar.setBackgroundColor('#1976D2',true);
  }*/
}



AppRegistry.registerComponent('RoteVocabApp', () => RoteVocabApp);
