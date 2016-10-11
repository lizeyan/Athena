#include "faceidentification.h"

#include <iostream>
#include <exception>
#include <cstring>
#include <curl/curl.h>
#include <json/json.h>
using namespace std;

static size_t callback(char *ptr, size_t size, size_t nmemb, string &stream){
  size_t sizes = size*nmemb;
  string temp(ptr,sizes);
  stream += temp;
  return sizes;
}

FaceIdentification::FaceIdentification(QObject *parent) : QObject(parent)
{

}

int FaceIdentification::test()
{
    CURL *curl;
    CURLcode res;
    curl_slist *list;
    string stream;
    long code;
    // set params
    Json::Value params;
    params["api_id"] = "332cc3d4d63e404693589ca02da83600";
    params["api_secret"] = "72e68c866c34405c8491839da7ffd4d0";
    params["face_id"] = "ff7e13742b5b4021a943daf88793d1da";
    params["group_id"] = "6c59b4c08e4d41d884118f3afc8fdb1b";
    string data = params.toStyledString();
    try
    {
      curl_global_init(CURL_GLOBAL_DEFAULT);
      curl = curl_easy_init();

      if( curl ){

        list = curl_slist_append(NULL,"Content-Type:application/json;charset=UTF-8");

        curl_easy_setopt(curl, CURLOPT_URL, "https://v1-api.visioncloudapi.com/face/identification");
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

        //string stupid=res_json.asString();

        //char*data=(char*)stupid.data();

        //QString now=QString::fromUtf8(data);

        cout<<"HTTP Status Code: "<<code<<endl;
        //cout<<res_json<<endl;

        Json::FastWriter writer;

        string strResult=writer.write(res_json);

        cout<<strResult<<endl;

        char *p=(char*)strResult.data();

        QString testcode=QString::fromUtf8(p);

        // End the libcurl easy handle

        curl_easy_cleanup(curl);

      }
      curl_global_cleanup();
    }catch(exception ex){
      cout<<"curl exception "<<ex.what()<<endl;
    }
    return 0;
}
