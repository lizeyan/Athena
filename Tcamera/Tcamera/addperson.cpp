#include "addperson.h"

#include <iostream>
#include <exception>
#include <cstring>
#include <QJsonObject>
#include <QtNetwork/QNetworkReply>

#include "HttpGet.h"
#include "httppost.h"

#include<iostream>
using namespace std;


AddPerson::AddPerson(QObject *parent) : QObject(parent)
{
    api_ID=QString("332cc3d4d63e404693589ca02da83600");

    api_secret=QString("72e68c866c34405c8491839da7ffd4d0");
}

int AddPerson::test()
{

    QString qurl=QString("https://v1-api.visioncloudapi.com/info/api")+
                 QString("?api_id=")+api_ID+
                 QString("&api_secret=")+api_secret;

    cout<<qurl.toStdString()<<endl;

    HttpGet*httpGet=new HttpGet();
    httpGet->sendRequest(qurl);


    qurl=QString("https://v1-api.visioncloudapi.com/face/detection")+
         QString("?api_id=")+api_ID+
         QString("&api_secret=")+api_secret;

        cout<<qurl.toStdString()<<endl;
    HttpPost*httpPost=new HttpPost();
    httpPost->sendRequest(qurl);
    return 0;
}
