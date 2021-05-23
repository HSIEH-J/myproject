class Api {
  // constructor() {
  //   this.API_HOST = 'https://huichiao.com/api/1.0';
  //   this.accessToken = undefined;
  // }

  async getBookmarkData () {
    const response = await fetch("/api/1.0/get");
    const data = await response.json();
    return data;
  }
}

export default new Api();

// async checkout (data) {
//     if (!this.accessToken) {
//       throw new Error("請先登入");
//     }
//     const response = await fetch(`${this.API_HOST}/order/checkout`, {
//       body: JSON.stringify(data),
//       headers: new Headers({
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${this.accessToken}`
//       }),
//       method: "POST"
//     });
//     if (response.status === 401) {
//       throw new Error("請先登入");
//     }
//     if (response.status === 403) {
//       throw new Error("內容錯誤或權限不足");
//     }
//     return await response.json();
// }

//   async signin (data) {
//     const response = await fetch(`${this.API_HOST}/user/signin`, {
//       body: JSON.stringify(data),
//       headers: new Headers({
//         "Content-Type": "application/json"
//       }),
//       method: "POST"
//     });
//     const json = await response.json();
//     this.accessToken = json.data.access_token;
//     return json;
//   }
