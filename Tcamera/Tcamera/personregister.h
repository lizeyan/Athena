#ifndef PERSONREGISTER_H
#define PERSONREGISTER_H

#include<QObject>


class PersonRegister : public QObject
{
    Q_OBJECT
public:
    explicit PersonRegister(QObject *parent = 0);

signals:

public slots:
};

#endif // PERSONREGISTER_H
