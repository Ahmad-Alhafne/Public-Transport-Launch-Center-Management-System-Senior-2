using System;
using System.Linq;
using System.Reflection;

var asmPath = Path.Combine(AppContext.BaseDirectory, "TripService.Application.dll");
if (!File.Exists(asmPath))
{
    Console.WriteLine($"Assembly not found: {asmPath}");
    return 1;
}
var asm = Assembly.LoadFrom(asmPath);
var type = asm.GetType("TripService.Application.Services.TripManagementService");
if (type == null)
{
    Console.WriteLine("Type TripService.Application.Services.TripManagementService not found in assembly.");
    return 1;
}
Console.WriteLine($"Found type: {type.FullName}");
foreach (var ctor in type.GetConstructors(BindingFlags.Public | BindingFlags.Instance))
{
    var paramsDesc = string.Join(", ", ctor.GetParameters().Select(p => p.ParameterType.Name + " " + p.Name));
    Console.WriteLine("ctor(" + paramsDesc + ")");
}
return 0;