#include "addperson.h"

#include <iostream>
#include <exception>
#include <cstring>
#include <curl/curl.h>
#include <QJsonObject>


using namespace std;

AddPerson::AddPerson()
{

}

size_t callback(char *ptr, size_t size, size_t nmemb, string &stream){

  size_t sizes = size*nmemb;
  string temp(ptr,sizes);
  stream += temp;
  return sizes;

}

int AddPerson::addPerson()
{
    CURL *curl;
    CURLcode res;
    curl_slist *list;
    string stream;
    long code;
    // set params
/*    Json::Value params;
    Json::Value face_id;
    params["api_id"] = "ID";
    params["api_secret"] = "SECRET";
    params["name"] = "faceset_name";
    params["face_id"].append("ecc34bbbcc2544ad8979dd8f1b38eaa6");
    params["face_id"].append("e4bd69291f0a4bfd96a2a008eb069191");
    string data = params.toStyledString();

    try
    {
      curl_global_init(CURL_GLOBAL_DEFAULT);
      curl = curl_easy_init();

      if( curl ){

        list = curl_slist_append(NULL,"Content-Type:application/json;charset=UTF-8");

        curl_easy_setopt(curl, CURLOPT_URL, "https://v1-api.visioncloudapi.com/faceset/create");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, list);
        curl_easy_setopt(curl,CURLOPT_POSTFIELDS, data.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &stream);
        //skip verification
        #ifdef SKIP_PEER_VERIFICATION
            curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
        #endif

        #ifdef SKIP_HOSTNAME_VERIFICATION
            curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
        #endif

        res = curl_easy_perform(curl);
        // perform failed
        if( res != CURLE_OK ){
          cout<<"curl_easy_perform() failed:"<<curl_easy_strerror(res)<<endl;
          return -1;
        }
        // HTTP Status Code
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
        // parse json
        Json::Reader *reader = new Json::Reader(Json::Features::strictMode());
        Json::Value res_json;
        if(!reader->parse(stream, res_json)){
              cout<<"parse error";
              return -1;
        }
        cout<<"HTTP Status Code: "<<code<<endl;
        cout<<res_json<<endl;
        // End the libcurl easy handle
        curl_easy_cleanup(curl);
      }
      curl_global_cleanup();
    }catch(exception ex){
      cout<<"curl exception "<<ex.what()<<endl;
    }*/
    return 0;
}
