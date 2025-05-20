from django.db import models

class Driver(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    profile_image_url = models.TextField(blank=True, null=True)
    car_image_url = models.TextField(blank=True, null=True)
    car_seats = models.PositiveIntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Ride(models.Model):
    origin_address = models.CharField(max_length=255)
    destination_address = models.CharField(max_length=255)
    origin_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    origin_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    ride_time = models.IntegerField()  # duration in minutes
    fare_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True)
    user_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride from {self.origin_address} to {self.destination_address}"
