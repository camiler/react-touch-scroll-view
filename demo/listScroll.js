import React, {Component} from 'react';
import TouchScroll from '../src/';
import './demo.less';

class ListScroll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
      listLength: 15
    }
  }
  renderList = () => {
    const {listLength} = this.state;
    const ls = [];
    for (let i = 1; i <= listLength; i++) {
      ls.push(<p key={i} style={{padding: 20, borderBottom: '1px solid #ccc'}}>list {i}</p>)
    }
    return ls;
  }

  loadMore = (v, callback) => {
    this.setState((({listLength}) => {
      return {
        listLength: listLength + 5
      }
    }), () => {
      callback();
    })
  }

  refreshList = () => {
    this.setState({
      listLength: 8
    })
  }

  getScroller = (scroller) => {
    console.log(scroller);
    console.log(scroller.current.scrollHeight)
  }

  render() {
    const {hasMore} = this.state;
    return (
      <TouchScroll
        isPullUp
        isPullDown
        loadMore={this.loadMore}
        refresh={this.refreshList}
        hasMore={hasMore}
        otherHeight={0}
        getScroller={this.getScroller}
      >
        {this.renderList()}
      </TouchScroll>
    )
  }
}

export default ListScroll;