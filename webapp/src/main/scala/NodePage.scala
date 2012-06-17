package com.graphbrain.webapp


import unfiltered.scalate._
import unfiltered.request._
import unfiltered.response._

import com.graphbrain.hgdb.VertexStore
import com.graphbrain.hgdb.Vertex
import com.graphbrain.hgdb.UserNode


case class NodePage(store: VertexStore, node: Vertex, user: UserNode, prod: Boolean, req: HttpRequest[Any], cookies: Map[String, Any], errorMsg: String="") {
	val gi = new GraphInterface(node.id, store, user)

  val userId = if (user == null) "" else user.id

  val js = "var nodes = " + gi.nodesJSON + ";\n" +
    "var snodes = " + gi.snodesJSON + ";\n" +
    "var links = " + gi.linksJSON + ";\n" +
    "var rootNodeId = '" + node.id + "';\n" +
    "var errorMsg = '" + errorMsg + "';\n" +
    "var userId = '" + userId + "';\n"

  def response = Server.scalateResponse("node.ssp", "node", cookies, req, js)
}

object NodePage {    
}