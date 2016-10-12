#include "detectionthread.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QVector>
#include <iostream>

#include "infoapi.h"
#include "facedetection.h"
#include "faceidentification.h"
#include "detectionthread.h"

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

    for(;;)
    {
        face="stupid";
        this->msleep(1000);
        FaceDetection faceDetection;

        writingLock.lock();
        isWriting=true;
        writingLock.unlock();

        faceLock.lock();

        faceDetection.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
        faceDetection.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));

        int code=faceDetection.test();

        faceLock.unlock();

        writingLock.lock();

        isWriting=false;

        writingLock.unlock();

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
                //face_ids.push_back(face_id);
                //cout<<face_id.toStdString()<<endl;
                cout<<face.toStdString()<<endl;
            }
        }

        if(face!="stupid")
        {
            FaceIdentification faceIdentification;

            faceIdentification.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
            faceIdentification.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));
            faceIdentification.setFace_id(face);
            faceIdentification.setGroup_id("6c59b4c08e4d41d884118f3afc8fdb1b");

            int code=faceIdentification.test();
            if(code==200)
            {
                QJsonDocument document=QJsonDocument::fromJson(faceIdentification.result.toUtf8());
                QJsonObject json=document.object();
                QJsonArray candidates=json.value(QString("candidates")).toArray();
                for(int i=0;i<candidates.size();++i)
                {
                    QJsonObject person=candidates.at(i).toObject();

                    QJsonValue personValue=person.value(QString("person_id"));
                    QJsonValue nameValue=person.value(QString("name"));
                    QString person_id=personValue.toString();
                    QString name_id=nameValue.toString();

                    //face_ids.push_back(face_id);
                    //cout<<face_id.toStdString()<<endl;
                    cout<<name_id.toStdString()<<endl;
                    emit newPerson(name_id);
                }
            }
        }
    }
}
