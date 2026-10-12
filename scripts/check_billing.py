import boto3
import datetime

def check_costs():
    ce = boto3.client('ce', region_name='us-east-1')
    now = datetime.date.today()
    start = now.replace(day=1).isoformat()
    end = (now + datetime.timedelta(days=1)).isoformat()

    res = ce.get_cost_and_usage(
        TimePeriod={'Start': start, 'End': end},
        Granularity='MONTHLY',
        Metrics=['UnblendedCost'],
        GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'}]
    )

    print(f"=== AWS Cost & Billing Report ({start} to {end}) ===")
    total = 0.0
    services = []
    for g in res.get('ResultsByTime', [{}])[0].get('Groups', []):
        service_name = g['Keys'][0]
        amt = float(g['Metrics']['UnblendedCost']['Amount'])
        if amt > 0.0001:
            services.append((service_name, amt))
            total += amt

    # Sort descending by cost
    services.sort(key=lambda x: x[1], reverse=True)
    for s_name, amt in services:
        print(f" - {s_name}: ${amt:.4f}")
    
    print("-" * 45)
    print(f"Total Month-to-Date: ${total:.2f}")

if __name__ == '__main__':
    check_costs()
