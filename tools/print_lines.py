import sys
p='backend/TripService/TripService.Api/Program.cs'
with open(p, 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, start=1):
        print(f"{i:04}: {l.rstrip()}")
