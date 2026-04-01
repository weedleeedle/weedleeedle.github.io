export default {
  pagination: {
    data: "collections.post",
    size: 1,
    before: function(paginationData, fullData) {
      return paginationData.sort((a, b) => a.data.index - b.data.index).filter((a) => a.data.published);
    }
  }
}
