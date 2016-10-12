#include "facedetection.h"

#include <iostream>
#include <cstring>
#include <exception>
#include <curl/curl.h>
#include <json/json.h>

using namespace std;
static size_t callback(char *ptr, size_t size, size_t nmemb, string &stream){

  size_t sizes = size*nmemb;
  string temp(ptr,sizes);
  stream += temp;
  return sizes;
}

FaceDetection::FaceDetection(QObject *parent) : QObject(parent)
{

}

void FaceDetection::setApi_id(QString id)
{
    api_id=id;
}

void FaceDetection::setApi_secret(QString secret)
{
    api_secret=secret;
}

int FaceDetection::test()
{
    result=QString("stupidMethod");
    CURL *curl;
    CURLM *multi_handle;
    CURLcode res;
    long code;
    string stream;
    struct curl_httppost *formpost = NULL;
    struct curl_httppost *lastptr = NULL;
    struct curl_slist *headerlist = NULL;

    char * filePath="face.jpg";

    try{

      curl_global_init(CURL_GLOBAL_DEFAULT);
      curl = curl_easy_init();

      if( curl ){

        curl_formadd(&formpost,&lastptr,CURLFORM_COPYNAME,"api_id",
                    CURLFORM_COPYCONTENTS, api_id.toStdString().c_str(),CURLFORM_END);
        curl_formadd(&formpost,&lastptr,CURLFORM_COPYNAME,"api_secret",
                    CURLFORM_COPYCONTENTS, api_secret.toStdString().c_str(),CURLFORM_END);
        curl_formadd(&formpost,&lastptr,CURLFORM_COPYNAME,"file",
                    CURLFORM_FILE, filePath, CURLFORM_END);

        curl_easy_setopt(curl, CURLOPT_URL, "https://v1-api.visioncloudapi.com/face/detection");
        curl_easy_setopt(curl, CURLOPT_HTTPPOST, formpost);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &stream);

        #ifdef SKIP_PEER_VERIFICATION
          curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
        #endif
        #ifdef SKIP_HOSTNAME_VERIFICATION
          curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
        #endif

        res = curl_easy_perform(curl);

        if( res != CURLE_OK ){
          cout<<"curl_easy_perform() failed:"<<curl_easy_strerror(res)<<endl;
          return -1;
        }
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &code);
        Json::Value res_data;
        Json::Reader *reader = new Json::Reader(Json::Features::strictMode());
        if(!reader->parse(stream, res_data)){
          cout<<"parse error";
          return -1;
        }
        cout<<"HTTP Status Code:"<<code<<endl;
        //cout<<res_data<<endl;

        Json::FastWriter writer;
        writer.write(res_data);

        string strResult=writer.write(res_data);
        //cout<<strResult<<endl;

        result=QString(strResult.c_str());

        curl_easy_cleanup(curl);
    }
      curl_global_cleanup();
      return code;

    }catch(exception &ex){
      cout<<"curl exception:"<<ex.what()<<endl;
    }
}
