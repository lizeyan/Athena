#include "infoapi.h"

#include "curl/curl.h"

#include <iostream>
#include <cstring>
#include <curl/curl.h>
#include <json/json.h>

using namespace std;

size_t callback(char *ptr, size_t size, size_t nmemb, string &stream){

  size_t sizes = size*nmemb;
  string temp(ptr,sizes);
  stream += temp;
  return sizes;

}

InfoAPI::InfoAPI(QObject *parent) : QObject(parent)
{

}

int InfoAPI::test()
{
    string url = "https://v1-api.visioncloudapi.com/info/api"
                 "?api_id=332cc3d4d63e404693589ca02da83600&api_secret=72e68c866c34405c8491839da7ffd4d0";

    CURL *curl;
    CURLcode res;
    string stream;
    long code;

    curl_global_init( CURL_GLOBAL_DEFAULT );
    curl = curl_easy_init();

    if( curl )
    {
      curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
      curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callback);
      curl_easy_setopt(curl, CURLOPT_WRITEDATA, &stream);
      // skip verification
      #ifdef SKIP_PEER_VERIFICATION
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
      #endif

      #ifdef SKIP_HOSTNAME_VERIFICATION
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
      #endif

      res = curl_easy_perform( curl );
      if( res != CURLE_OK ){
        cout<<"curl_easy_perform() failed:"<<curl_easy_strerror(res)<<endl;
        return -1;
      }
      // HTTP Status Code
      curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
      // parse json
      Json::Value res_data;
      Json::Reader *reader = new Json::Reader(Json::Features::strictMode());
      if(!reader->parse(stream, res_data)){
        cout<<"parse error";
        return -1;
      }
      cout<<"HTTP Status Code:"<<code<<endl;
      cout<<res_data<<endl;
      curl_easy_cleanup(curl);
    }
    curl_global_cleanup();

    return 0;
}
