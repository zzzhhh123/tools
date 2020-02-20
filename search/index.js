/**
 * 参数说明
 *  data：需要搜索的总数据
 *  keyword：查询关键字
 *  key：查询key，比如id、name
 * 使用方法：
 *  import {Search} from '...';
 *  let result newSearch(data, keyword, key);
 *  console.log(result);
 */

function Search(data, keyword, key) {

  this.allData = data; // 需要查询的总数据
  this.keyword = keyword;
  this.key = key;

  return this.createKeyArr();
}

// 查询的key的所有值的集合，比如查询值为name，此处提取所有数据中的name值
Search.prototype.createKeyArr = function () {
  let allData = this.allData;

  let key = this.key;
  let keyArr = []; // key值的数组集合

  for (let index = 0; index < allData.length; index++) {
    if (allData[index].hasOwnProperty(key)) { // 如果没有找到key则略过
      keyArr.push(allData[index][key]); 
    }
  }
  this.keyArr = keyArr;
  return this.createSearchKeyArr();
}

// 循环key值数组，匹配传入的搜索keyword的索引值放进新数组里
Search.prototype.createSearchKeyArr = function () {
  let keyArr = this.keyArr;
  let keyword = this.keyword;

  let regKey = new RegExp(keyword, 'ig');
  let resultIndexArr = []; // 结果的索引值

  for (let index = 0; index < keyArr.length; index++) {
    let searchKey = keyArr[index].toString();
    if (searchKey.match(regKey)) {
      resultIndexArr.push(index);
    }
  }
  this.resultIndexArr = resultIndexArr;
  return this.createResultArr();
}

// 循环匹配的索引值的数组，得到最终索引结果
Search.prototype.createResultArr = function () {
  let allData = this.allData;
  let resultIndexArr = this.resultIndexArr;

  let resultArr = []; // 最终匹配的集合

  for (let index = 0; index < resultIndexArr.length; index++) {
    const element = allData[resultIndexArr[index]];
    resultArr.push(element);
  }
  return resultArr;
}

export {
  Search
}
