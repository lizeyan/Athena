#ifndef ADDPERSON_H
#define ADDPERSON_H

#include <QObject>
#include <QtNetwork/QNetworkReply>

class AddPerson : public QObject
{
    Q_OBJECT
public:
    explicit AddPerson(QObject *parent = 0);

    int test();

    QString api_ID;
    QString api_secret;

    QNetworkReply*reply;

signals:

public slots:

    void replyFinish(QNetworkReply*);

    void onReadyRead();
};

#endif // ADDPERSON_H
