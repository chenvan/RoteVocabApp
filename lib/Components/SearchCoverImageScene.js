import React, { Component } from  'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ListView,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  BackAndroid
} from 'react-native';

import { rvDB, bookAPI } from '../rvAPI';
import { CustomImageButton } from './Button';
import { connect } from 'react-redux';
import { changeVocabListCoverUrl } from './../Action/Action';

class SearchCoverImageScene extends Component {
  constructor(props){
    super(props);

    const dataSource = new ListView.DataSource({rowHasChanged:(r1,r2) => {
	  		return r1.id !== r2.id
	  	}
	  });

    this.state = {
      searchInfo: this.props.information,
      dataSource,
      fetchData: false
    };

    this._SearchCoverImageSceneBackPressHandler = this._SearchCoverImageSceneBackPressHandler.bind(this);
  }

  componentDidMount() {
		//android后退键设置
		BackAndroid.addEventListener('searchCoverImageScene',this._SearchCoverImageSceneBackPressHandler);
	}

	componentWillUnmount(){
		BackAndroid.removeEventListener('searchCoverImageScene',this._SearchCoverImageSceneBackPressHandler);
	}

  render(){
    return (
      <View>
        <View style={{flex:0,height:56,flexDirection:'row',backgroundColor:'#2196F3',alignItems:'center'}}>
          <CustomImageButton
            source={{uri: 'ic_arrow_back_white_36dp'}}
            onPress={this._cancel.bind(this)}
            style={{height:36,width:36,marginRight:10,marginLeft:5}}
          />
          <TextInput
            style = {{fontSize:22, flex:1,color:'white'}}
            onChangeText = { (searchInfo) => this.setState({searchInfo})}
            value = {this.state.searchInfo}
            underlineColorAndroid = 'white'
            inlineImageLeft = 'ic_search_white_36dp'
            inlineImagePadding = {5}
            onSubmitEditing = {this._search.bind(this,this.state.searchInfo)}
            autoFocus = {true}
            returnKeyType = {'search'}
          />
        </View>
        {
          this.state.fetchData?
          //this.state.fetchData && <ActivityIndicator animating={this.state.fetchData} size="large" style={{marginTop:26}} />
          <Text style={{fontSize:22,textAlign:'center',marginTop:30}}>{'加载中...'}</Text>
          :
          <ListView
            dataSource = {this.state.dataSource}
            enableEmptySections = {true}
            style = {{marginTop:8}}
            keyboardShouldPersistTaps = {'always'}
            renderRow = {(rowData, sectionID, rowID)=>(
                          <TouchableOpacity onPress={this._changeCoverUrl.bind(this, rowData.id, this.props.information)}>
                            <View style={rowData.title === undefined ? {} : {paddingVertical:12,borderBottomWidth:1,borderColor:"#90CAF9"}}>
                                <Text style={{fontSize:20, paddingLeft:16,textAlignVertical:'center'}}>{rowData.title}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
          />
        }
      </View>
    );
  };

  _cancel(){
    this.props.navigator.pop();
  };

  _search(bookInfo){

    this.setState({fetchData: true});

    bookAPI.getBookID(bookInfo, 100).then((marchBooks)=>{
      if(marchBooks.count > 0){
        this.setState({
          fetchData: false,
          dataSource: this.state.dataSource.cloneWithRows(marchBooks.books)
        });
      }else{
        ToastAndroid.show('在豆瓣中没找到'+bookInfo+'相关内容，请换一个关键词',ToastAndroid.LONG);
        this.setState({
          fetchData: false,
          dataSource: this.state.dataSource.cloneWithRows([{}])
        });
      }
    }).catch((e)=>{
      ToastAndroid.show(''+e, ToastAndroid.SHORT);
      this.setState({
        fetchData: false,
        dataSource: this.state.dataSource.cloneWithRows([{}])
      });
    })

  };

  _changeCoverUrl(doubanBookID, vocabListName){

    this.setState({
      fetchData: true
    });

    this.props.changeVocabListCoverUrl(doubanBookID, vocabListName).then(() => {
      this._cancel();
    }).catch((e) => {
      ToastAndroid.show(''+e, ToastAndroid.SHORT);
      this.setState({
        fetchData: false
      })
    })

  }


  _SearchCoverImageSceneBackPressHandler(){
    this._cancel();
  }

}


var mapDispatchToProps = (dispatch) => {
  return {
    changeVocabListCoverUrl: (id, vocabListName) =>  dispatch(changeVocabListCoverUrl(id, vocabListName))
  }
}

export default connect(null, mapDispatchToProps)(SearchCoverImageScene);
