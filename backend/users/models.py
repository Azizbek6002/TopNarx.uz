import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

from common.models import BaseModel
from places.models import Restaurant

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True, null=True)

    email = models.EmailField(unique=True)

    ROLE_CHOICES = (
        ("user", "Oddiy foydalanuvchi"),
        ("owner", "Do'kon egasi"),
        ("admin", "Admin"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")




    def __str__(self):
        return self.email



class Favorite(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="favorited_by")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "restaurant"], name="uniq_user_restaurant_favorite")
        ]

    def __str__(self):
        return f"{self.user} ❤️ {self.restaurant}"

