## 滑动上拉加载组件

基于[alloyTouch](https://github.com/AlloyTeam/AlloyTouch)和[transfrom](https://github.com/AlloyTeam/AlloyTouch/tree/master/transformjs)的react滑动组件。目前有两种用法：   

1. 单纯上滑滚动
```
<TouchScroll 
  scrollCls="target的样式名称" 
  touchCls="touch的样式名称" 
  otherHeight={number: 其他需要排除计算的高度，这与min值有关}
  getScroller={func: 设置的话会在回调中返回当前this.scroller对象，方便外部进行this.scroller的transform效果}
>
  {children dom}    
</TouchScroll>
```

2. 有上滑加载更多的滑动
```
<TouchScroll 
  isPullUp
  scrollCls="target的样式名称" 
  touchCls="touch的样式名称" 
  otherHeight={number: 其他需要排除计算的高度，这与min值有关}
  getScroller={func: 设置的话会在回调中返回当前this.scroller对象，方便外部进行this.scroller的transform效果}
  changeCb={func: 在滑动change的过程中回调}
  loadMore={func: 加载更多时的请求处理等}
  hasMore={bool: 外部控制是否有更多}
  error={bool: 外部控制加载更多时请求是否异常等}
>
  {children dom}    
</TouchScroll>
```
----------------------
### 注意

1. 在设置target和touch的样式时，target是absolute，而touch相当于整个页面的滑动罩层，是铺面整个屏幕的（这里的覆盖整个视口已经写好，z-index是1）     

2. 如果在target上面还有其他dom结构，这些dom结构也应是absolute，同时在外层组件通过transform设置这些结构，以便target滚动时，这些dom也会滚动。此外，这些dom结构的z-index也要根据情况进行设置     

3. target的样式设置时，注意top和padding-top的值。 

4. 上滑的关键在于min值的缺点，所以对于otherHeight的值一定要计算正确。如果是整个视口页面的滑动，那么就不需要设置这个值了。比方说：页面视口底部有个fix的60px高度的按钮，而滚动元素就是除这个按钮的高度内可见，那么这个值就设置为60。 

具体demo原理可以参照[QQ看点demo](https://github.com/AlloyTeam/AlloyTouch/wiki/kandian)