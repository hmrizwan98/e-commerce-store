const appendBaseUrl = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/${path}`;
};

class Paths {
  static BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`;
  static SLIDER = appendBaseUrl('slider');
  // static USER_QUERY_IMAGE = appendBaseUrl(`user/user-query-image`);
  // static USER_QUERY = appendBaseUrl(`user/user-query`);
}

export default Paths;
