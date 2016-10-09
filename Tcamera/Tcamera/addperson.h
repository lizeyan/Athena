#ifndef ADDPERSON_H
#define ADDPERSON_H

#include <cstring>
#include <string>

class AddPerson
{
public:
    AddPerson();
    size_t callback(char *ptr, size_t size, size_t nmemb, std::string &stream);
    int addPerson();
};

#endif // ADDPERSON_H
