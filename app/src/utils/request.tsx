export const deleteRecord = async (url: string, userToken: string | null) => {
  if (userToken) {
    
    let response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`
      },
    });
    if (response.status !== 200) {
      const text = (await response.text()).substring(0, 1024);
      throw new Error(`${response.status}: ${text}`);
      /*if (response.status === 403) {
        throw new NVError('RightsExpire');
      } else {
        const text = (await response.text()).substring(0, 1024);
        throw new NVError('Unknown', {
          cause: new Error(`${response.status}: ${text}`)
        });
      }*/
    }
    const resp = await response.json();
    if (resp.errors) {
      throw new Error(resp.errors);
    }
    return resp;
  }
  throw new Error('RightsExpire');
}
