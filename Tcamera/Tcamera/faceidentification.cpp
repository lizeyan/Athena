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

void FaceIdentification::setApi_id(QString id)
{
    api_id=id;
}

void FaceIdentification::setApi_secret(QString secret)
{
    api_secret=secret;
}

void FaceIdentification::setFace_id(QString _face_id)
{
    face_id=_face_id;
}

void FaceIdentification::setGroup_id(QString _group_id)
{
    group_id=_group_id;
}

int FaceIdentification::test()
{
    result=QString("stupidMethod");
    CURL *curl;
    CURLcode res;
    curl_slist *list;
    string stream;
    long code;
    // set params
    Json::Value params;
    params["api_id"] = api_id.toStdString().c_str();
    params["api_secret"] = api_secret.toStdString().c_str();
    params["face_id"] = face_id.toStdString().c_str();
    params["group_id"] = group_id.toStdString().c_str();
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


        cout<<"HTTP Status Code: "<<code<<endl;
        //cout<<res_json<<endl;

        Json::FastWriter writer;

        string strResult=writer.write(res_json);

        //cout<<strResult<<endl;

        char *p=(char*)strResult.data();

        result =QString::fromUtf8(p);

        // End the libcurl easy handle

        curl_easy_cleanup(curl);

      }
      curl_global_cleanup();
      return code;
    }catch(exception ex){
      cout<<"curl exception "<<ex.what()<<endl;
    }
    return 0;
}
