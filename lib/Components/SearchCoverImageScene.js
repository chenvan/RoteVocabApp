import React, { Component } from  'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ListView,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity
} from 'react-native';

import { rvDB, bookAPI } from '../rvAPI';
import { CustomButton } from './Button';

export default class SearchCoverImageScene extends Component {
  constructor(props){
    super(props);

    const ds = new ListView.DataSource({rowHasChanged:(r1,r2) => {
	  		return r1.id !== r2.id
	  	}
	  });

    this.state = {
      searchInfo: this.props.itemName,
      dataSource: ds.cloneWithRows([{}]),
      fetchData: false
    };
  }

  render(){
    return (
      <View>
        <TextInput
          style = {{fontSize:20, lineHeight: 40}}
          onChangeText = { (searchInfo) => this.setState({searchInfo})}
          value = {this.state.searchInfo}
        />
        <View style ={{flex:0, flexDirection:'row',justifyContent:'space-around',alignItems:'center', borderBottomWidth:1, borderColor:'red'}} >
          <CustomButton text={'搜索'} style={styles.text} onPress={this._search.bind(this, this.state.searchInfo)}/>
          <CustomButton text={'取消'} style={styles.text} onPress={this._cancel.bind(this)} />
        </View>
        {
          this.state.fetchData ?
          <ActivityIndicator size="large" style={{marginTop:10}} />
          :
          <ListView
            dataSource = {this.state.dataSource}
            enableEmptySections = {true}
            style = {{marginTop:8}}
            renderRow = {(rowData, sectionID, rowID)=>(
                          <TouchableOpacity onPress={this._getCoverImageUrl.bind(this, rowData.id)}>
                            <View style={rowData.title === undefined ? {} : {paddingVertical:10,borderBottomWidth:1,borderColor:"#90CAF9"}}>
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

    this.setState({fetchData: true});
  };

  _getCoverImageUrl(id){

    bookAPI.getBookCoverUrl(id).then((url)=>{

      if(url === undefined){
        url = '';
      }

      return rvDB.changeItemBookCoverUrl(this.props.itemName, url);

    }).then(()=>{

        this.props.navigator.popToTop();

    }).catch((e)=>{

      ToastAndroid.show(''+e,ToastAndroid.SHORT);
      this.setState({fetchData: false})

    })

    this.setState({fetchData: true});
  };

}

const styles = StyleSheet.create({
  text : {
    fontSize: 18,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  }
})
