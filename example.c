#include <stdio.h>

int main() {
  int a;
  int b;
  int c;

  printf("Enter a number: ");
  scanf("%d", &a);
  printf("Enter another number: ");
  scanf("%d", &b);
  
  c = a + b;

  printf("%d\n", c);
}