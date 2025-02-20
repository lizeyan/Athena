#include "detectionthread.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QVector>
#include <iostream>
#include <set>

#include "infoapi.h"
#include "facedetection.h"
#include "faceidentification.h"
#include "detectionthread.h"
#include "personregister.h"

using namespace std;

DetectionThread::DetectionThread(QObject *parent) : QThread(parent)
{
    isWriting=false;
}

void DetectionThread::run()
{
    //InfoAPI infoApi;
    //infoApi.test();

    QString face;
    FaceDetection faceDetection;

    writingLock.lock();
    isWriting=true;
    writingLock.unlock();
    FaceIdentification faceIdentification;

    int code;

    for(int i=0;i<faceCount;++i)
    {
        faceDetection.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
        faceDetection.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));
        faceDetection.setFace(QString("file")+QString::number(i,10)+QString(".jpg"));

        code=faceDetection.test();

        if(code==200)
        {
            QJsonDocument document=QJsonDocument::fromJson(faceDetection.result.toLocal8Bit().data());
            QJsonObject json=document.object();
            QJsonArray faces=json.value(QString("faces")).toArray();
            for(int i=0;i<faces.size();++i)
            {
                QJsonValue faceValue=faces.at(i).toObject().value(QString("face_id"));
                QString face_id=faceValue.toString();
                face=face_id;
                cout<<face_id.toStdString()<<endl;
            }
        }

        faceIdentification.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
        faceIdentification.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));
        faceIdentification.setFace_id(face);
        faceIdentification.setGroup_id("6c59b4c08e4d41d884118f3afc8fdb1b");

        code=faceIdentification.test();
        if(code==200)
        {
            QJsonDocument document=QJsonDocument::fromJson(faceIdentification.result.toUtf8());
            QJsonObject json=document.object();
            QJsonArray candidates=json.value(QString("candidates")).toArray();
            QString bestPersonId;
            QString bestPersonName;
            double bestConfidence=-1.0;
            for(int i=0;i<candidates.size();++i)
            {
                QJsonObject person=candidates.at(i).toObject();

                QJsonValue personValue=person.value(QString("person_id"));
                QJsonValue nameValue=person.value(QString("name"));
                QJsonValue confidenceValue=person.value("confidence");

                QString person_id=personValue.toString();
                QString name_id=nameValue.toString();
                double confidence=confidenceValue.toDouble();

                if(confidence>bestConfidence)
                {
                    bestPersonId=person_id;
                    bestPersonName=name_id;
                    bestConfidence=confidence;
                }
            }
            if(bestConfidence>0)
            {
                emit newPerson(bestPersonName+"已被检测到");
            }
        }

        this->msleep(200);


    }

    writingLock.lock();
    isWriting=false;
    writingLock.unlock();



}
