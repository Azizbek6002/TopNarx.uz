from django.db import models
from common.models import BaseModel


class MenuCategory(BaseModel):
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=90, unique=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class MenuItem(BaseModel):
    UNIT_CHOICES = (
        ("ml", "ml"),
        ("dona", "dona"),
        ("g", "g"),
        ("pcs", "pcs"),
    )

    name = models.CharField(max_length=120)
    normalized_name = models.CharField(max_length=140, db_index=True, blank=True)
    category = models.ForeignKey(MenuCategory, on_delete=models.PROTECT, related_name="items")
    default_unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="pcs")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["normalized_name"]),
            models.Index(fields=["is_active"]),
        ]

    def save(self, *args, **kwargs):
        self.normalized_name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MenuItemVariant(BaseModel):
    UNIT_CHOICES = MenuItem.UNIT_CHOICES

    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="variants")
    size_value = models.IntegerField()
    size_unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    label = models.CharField(max_length=30)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["item", "size_value", "size_unit"],
                name="uniq_item_size_unit"
            )
        ]
        ordering = ["item__name", "size_value"]

    def __str__(self):
        return f"{self.item.name} {self.label}"

# normalized_name ni keyin signal bilan auto qilib qo‘yamiz, hozir MVP’da admin kiritib turadi (tez).
