import sys
import os
import logging
import asyncio

import xviz_avs
from xviz_avs.server import XVIZServer, XVIZBaseSession


class XVIZMemorySourceSession(XVIZBaseSession):
    def __init__(self, socket, request, source):
        super().__init__(socket, request)
        self.source = source
        self._socket = socket

    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    async def main(self):
        for name, data in self.source._data.items():
            await self._socket.send(data)


class XVIZMemorySourceHandler:
    def __init__(self, dataMap):
        self.dataMap = dataMap

    def __call__(self, socket, request):
        if request.log in self.dataMap:
            data = self.dataMap[request.log]
            return XVIZMemorySourceSession(socket, request, data)
        return None


class SimpleServer:
    def __init__(self, port=3000):
        self.logger = logging.StreamHandler(sys.stdout)
        self.logger.setLevel(logging.DEBUG)
        logging.getLogger("xviz-server").addHandler(self.logger)

        # Dictionary to map name to XVIZ MemorySource
        self.map = {}
        # XVIZServer handler to lookup requests using the map
        self.handler = XVIZMemorySourceHandler(self.map)

        self.server = XVIZServer(self.handler, port)

    def register(self, key, value):
        self.map[key] = value

    async def serve(self):
        return await self.server.serve()
