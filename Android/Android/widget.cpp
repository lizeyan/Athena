#include "widget.h"
#include "ui_widget.h"

#include <QHBoxLayout>
#include <QVBoxLayout>
#include <QLabel>

using namespace cv;

Widget::Widget(QWidget *parent) :
    QWidget(parent)
{
    QHBoxLayout *hLayout=new QHBoxLayout();
    QLabel *hello=new QLabel();
    hello->setText("Hello World!");
    hLayout->addWidget(hello);
    this->setLayout(hLayout);
}

Widget::~Widget()
{
}
