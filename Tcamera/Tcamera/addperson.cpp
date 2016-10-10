#include "addperson.h"

#include <iostream>
#include <exception>
#include <cstring>
#include <QJsonObject>
#include <QtNetwork/QNetworkReply>

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

    //qurl=QString("https://www.baidu.com/");

    QNetworkRequest request;

    cout<<qurl.toStdString()<<endl;

    request.setUrl(qurl);

    QNetworkAccessManager *manager = new QNetworkAccessManager(this);

    connect(manager, SIGNAL(finished(QNetworkReply*)), this, SLOT(replyFinish(QNetworkReply*)));

    reply=manager->get(request);

    connect(reply,SIGNAL(readyRead()),this,SLOT(onReadyRead()));

    return 0;
}


void AddPerson::replyFinish(QNetworkReply* reply)
{
    QByteArray res=reply->readAll();
    char *str=res.data();
    QString re=QString(str);
    cout<<"stupid"<<endl;
    cout<<re.toStdString()<<endl;

}

void AddPerson::onReadyRead()
{
    QByteArray res=reply->readAll();
    char *str=res.data();
    QString re=QString(str);
    cout<<"stupid"<<endl;
    cout<<re.toStdString()<<endl;
}
